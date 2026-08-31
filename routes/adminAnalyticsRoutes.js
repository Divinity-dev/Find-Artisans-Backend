import express from 'express'

import {

  getDashboardStats,

  getVerificationQueue,

  verifyUser,

  deleteVerificationRequest,

  getWorkers,

  getCustomers,

  getComplaints,

  getJobs,

  deleteAdminUser,

  deleteAdminJob,

  deleteAdminComplaint,

  sendAdminEmail,

} from '../controllers/adminAnalyticsControllers.js'

import {
  protect,
  adminOnly,
} from '../Middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats', protect, adminOnly, getDashboardStats)

router.get('/verifications', protect, adminOnly, getVerificationQueue)

router.post('/email', protect, adminOnly, sendAdminEmail)

router.put('/verifications/:id/verify', protect, adminOnly, verifyUser)

router.delete('/verifications/:id', protect, adminOnly, deleteVerificationRequest)

router.get('/workers', protect, adminOnly, getWorkers)

router.get('/customers', protect, adminOnly, getCustomers)

router.get('/jobs', protect, adminOnly, getJobs)

router.get('/complaints', protect, adminOnly, getComplaints)

router.delete('/users/:id', protect, adminOnly, deleteAdminUser)

router.delete('/jobs/:id', protect, adminOnly, deleteAdminJob)

router.delete('/complaints/:id', protect, adminOnly, deleteAdminComplaint)

export default router