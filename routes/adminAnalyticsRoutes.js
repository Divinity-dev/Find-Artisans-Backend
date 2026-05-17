import express from 'express'
import {
  getDashboardStats,
  getVerificationQueue,
  getComplaintOverview,
  getJobOverview,
} from '../controllers/adminController.js'

import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Dashboard overview
router.get('/stats', protect, adminOnly, getDashboardStats)

// Pending verifications
router.get('/verifications', protect, adminOnly, getVerificationQueue)

// Complaints overview
router.get('/complaints', protect, adminOnly, getComplaintOverview)

// Jobs overview
router.get('/jobs', protect, adminOnly, getJobOverview)

export default router