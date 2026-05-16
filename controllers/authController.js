// controllers/authController.js

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto'
import User from '../models/User.js'

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
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      })
    }

    // Generate 6 Digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    // Expiry Time (10 mins)
    const otpExpiry = Date.now() + 10 * 60 * 1000

    // Save OTP
    const hashedOTP = crypto
  .createHash('sha256')
  .update(otp)
  .digest('hex')

user.resetPasswordOTP = hashedOTP
    user.resetPasswordOTPExpires = otpExpiry

    await user.save()

    // ======================================
    // SEND EMAIL HERE
    // ======================================

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
)
    console.log(`
      OTP FOR ${user.email}: ${otp}
    `)

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// VERIFY OTP
// ======================================
export const verifyPasswordOTP = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check OTP
   const hashedInput = crypto
  .createHash('sha256')
  .update(otp)
  .digest('hex')

if (user.resetPasswordOTP !== hashedInput) {
  return res.status(400).json({
    success: false,
    message: 'Invalid OTP',
  })
}

    // Check Expiry
    if (
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }

    user.resetPasswordOTP = undefined
    user.resetPasswordOTPExpires = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// RESET PASSWORD
// ======================================
export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Validate OTP
    const hashedInput = crypto
  .createHash('sha256')
  .update(otp)
  .digest('hex')

if (user.resetPasswordOTP !== hashedInput) {
  return res.status(400).json({
    success: false,
    message: 'Invalid OTP',
  })
}

    // Check Expiry
    if (
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(
      newPassword,
      salt
    )

    user.password = hashedPassword

    // Clear OTP
    user.resetPasswordOTP = undefined
    user.resetPasswordOTPExpires = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}