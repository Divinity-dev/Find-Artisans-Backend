// routes/authRoutes.js

import express from 'express'

import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyPasswordOTP,
  resetPassword,
} from '../controllers/authController.js'

import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// ======================================
// AUTH ROUTES
// ======================================

// Register
router.post('/register', registerUser)

// Login
router.post('/login', loginUser)

// ======================================
// PASSWORD RESET WITH OTP
// ======================================

// Send OTP To Email
router.post('/forgot-password', forgotPassword)

// Verify OTP
router.post('/verify-otp', verifyPasswordOTP)

// Reset Password
router.patch('/reset-password', resetPassword)

export default router