import jwt from 'jsonwebtoken'
import User from '../models/users.js'

// Protect Routes Middleware
export const protect = async (req, res, next) => {
  try {
    let token

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // No Token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      })
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get User
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended',
      })
    }

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    })
  }
}

// Admin Middleware
export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access only',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Worker Middleware
export const workerOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      })
    }

    if (req.user.role !== 'worker') {
      return res.status(403).json({
        success: false,
        message: 'Worker access only',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Customer Middleware
export const customerOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      })
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Customer access only',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}