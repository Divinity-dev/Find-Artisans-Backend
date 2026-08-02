// controllers/authController.js

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import User from '../models/users.js'

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

    // Check Existing User
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    )

    // Create User
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
    })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
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
// LOGIN USER
// ======================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find User
    const user = await User.findOne({ email })

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