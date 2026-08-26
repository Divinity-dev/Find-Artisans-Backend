// routes/userRoutes.js

import express from 'express'

import {
  getMyProfile,
  updateMyProfile,
  updateMyLocation,
  getSingleUser,
  getAllWorkers,
  updateAvailability,
  deleteMyAccount,
} from '../controllers/userController.js'

import {
  protect,
  workerOnly,
} from '../Middleware/authMiddleware.js'

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

// Get All Workers 
router.get('/workers/all', getAllWorkers)

router.patch(
  '/location',
  protect,
  updateMyLocation
)

// Update Worker Availability
router.patch(
  '/worker/availability',
  protect,
  workerOnly,
  updateAvailability
)

// Get Single User
router.get('/:id', getSingleUser)





export default router