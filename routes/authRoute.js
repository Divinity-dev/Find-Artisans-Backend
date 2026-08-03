// routes/authRoutes.js

import express from 'express'

import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';

import { protect } from '../Middleware/authMiddleware.js'

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

// verify otp
router.post('/verify-otp', verifyOtp);
// Reset Password
router.patch('/reset-password', resetPassword);

export default router