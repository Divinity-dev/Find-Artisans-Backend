// controllers/authController.js

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import User from '../models/users.js'
import welcomeEmail from '../utils/emailTemplates/welcomeEmail.js'
import verificationEmail from '../utils/emailTemplates/verificationEmail.js'

// ======================================
// GENERATE JWT
// ======================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// ======================================
// REGISTER USER
// ======================================
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
    } = req.body

    // ======================================
    // NORMALIZE EMAIL
    // ======================================
    const normalizedEmail = email.trim().toLowerCase()

    // ======================================
    // CHECK EXISTING USER
    // ======================================
    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    // ======================================
    // HASH PASSWORD
    // ======================================
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    )

    // ======================================
    // GENERATE EMAIL VERIFICATION TOKEN
    // ======================================
    const verificationToken =
      crypto.randomBytes(32).toString('hex')

    // Hash token before storing it
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex')

    // ======================================
    // CREATE USER
    // ======================================
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role,

      // Email verification
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires:
        Date.now() + 24 * 60 * 60 * 1000,
    })

    // ======================================
    // CREATE VERIFICATION URL
    // ======================================
    const verificationUrl =
  `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`

    // ======================================
    // SEND WELCOME EMAIL
    // ======================================
    try {
      await sendEmail(
        user.email,
        'Welcome to FindArtisans 🎉',
        welcomeEmail(user.fullName)
      )
    } catch (emailError) {
      // Email failure should NOT prevent account creation
      console.error(
        'Welcome email failed:',
        emailError.message
      )
    }

    // ======================================
    // SEND VERIFICATION EMAIL
    // ======================================
    try {
      await sendEmail(
        user.email,
        'Verify your FindArtisans email',
        verificationEmail(
          user.fullName,
          verificationUrl
        )
      )
    } catch (emailError) {
      // Email failure should NOT prevent account creation
      console.error(
        'Verification email failed:',
        emailError.message
      )
    }

    // ======================================
    // RESPONSE
    // ======================================
    res.status(201).json({
  success: true,
  message:
    'Account created successfully. Please check your email to verify your account.',
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  },
})

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// VERIFY EMAIL
// ======================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).send(`
        <h2>Email verification failed</h2>
        <p>Verification token is missing.</p>
      `)
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find user
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    })

    if (!user) {
      return res.status(400).send(`
        <h2>Invalid verification link</h2>
        <p>This verification link is invalid or has already been used.</p>
      `)
    }

    // Check expiration
    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).send(`
        <h2>Verification link expired</h2>
        <p>
          This verification link has expired.
          Please request a new verification email.
        </p>
      `)
    }

    // Mark email as verified
    user.isEmailVerified = true

    // Remove verification token
    user.emailVerificationToken = null
    user.emailVerificationExpires = null

    await user.save()

    // Redirect user back to FindArtisans
    return res.redirect(
      'https://www.find-artisans.com/login?verified=true'
    )

  } catch (error) {
    console.error(
      'Email verification error:',
      error
    )

    return res.status(500).send(`
      <h2>Something went wrong</h2>
      <p>
        We couldn't verify your email at this time.
        Please try again later.
      </p>
    `)
  }
}


// ======================================
// LOGIN USER
// ======================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

const normalizedEmail = email.trim().toLowerCase()

    // Find User
    const user = await User.findOne({
  email: normalizedEmail,
})

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Compare Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // ======================================
    // CHECK EMAIL VERIFICATION
    // ======================================
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Please verify your email before logging in.',
      })
    }

    // Check Suspension
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      })
    }

    user.lastLogin = new Date()

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        verification: user.verification,
        isEmailVerified: user.isEmailVerified,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// FORGOT PASSWORD (SEND OTP)
// ======================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Save hashed OTP + expiry
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      'FindArtisans Password Reset OTP',
      `
        <div style="font-family: Arial;">
          <h2>Password Reset Request</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `
    );

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// VERIFY OTP 
// ======================================

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const hashedInput = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const isExpired = user.resetPasswordOTPExpires < Date.now();
  

    if (user.resetPasswordOTP !== hashedInput || isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    user.isOtpVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
//  RESET PASSWORD
// ======================================
export const resetPassword = async (req, res) => {
  try {
    console.log("RESET BODY:", req.body);
    let { email, password } = req.body;

email = email.trim().toLowerCase();
 console.log("EMAIL RECEIVED:", email);

    const user = await User.findOne({ email });
  console.log("FOUND USER:", user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isOtpVerified) {
      return res.status(403).json({
        success: false,
        message: 'OTP not verified',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // cleanup
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};