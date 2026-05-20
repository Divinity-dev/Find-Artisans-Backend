// routes/userRoutes.js

import express from 'express'

import {
  getMyProfile,
  updateMyProfile,
  getSingleUser,
  getAllWorkers,
  updateAvailability,
  deleteMyAccount,
} from '../controllers/userController.js'

import {
  protect,
  workerOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

// ======================================
// USER PROFILE
// ======================================

// Get Logged In User
router.get('/me', protect, getMyProfile)

// Update Logged In User
router.patch('/me', protect, updateMyProfile)

// Delete Account
router.delete('/me', protect, deleteMyAccount)

// ======================================
// PUBLIC ROUTES
// ======================================

// Get Single User
router.get('/:id', getSingleUser)

// Get All Workers
router.get('/workers/all', getAllWorkers)

// ======================================
// WORKER ROUTES
// ======================================

// Update Worker Availability
router.patch(
  '/worker/availability',
  protect,
  workerOnly,
  updateAvailability
)

export default router