import express from 'express'

import {
  getDashboardStats,
  getVerificationQueue,
  verifyWorker,
  getWorkers,
  getCustomers,
  getComplaints,
  getJobs,
} from '../controllers/adminAnalyticsControllers.js' // ✅ FIXED NAME

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats', protect, adminOnly, getDashboardStats)

router.get('/verifications', protect, adminOnly, getVerificationQueue)

router.put('/verifications/:id/verify', protect, adminOnly, verifyWorker)

router.get('/workers', protect, adminOnly, getWorkers)

router.get('/customers', protect, adminOnly, getCustomers)

router.get('/jobs', protect, adminOnly, getJobs)

router.get('/complaints', protect, adminOnly, getComplaints)

export default router