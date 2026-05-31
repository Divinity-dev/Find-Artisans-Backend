import express from 'express'

import {
  createJob,
  getAllJobs,
  getMyJobs,
  applyToJob,
  assignWorker,
  updateJobStatus,
} from '../controllers/jobControllers.js'

import {
  protect,
  workerOnly,
  adminOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

// ======================
// JOBS
// ======================

// Create job (customer)
router.post('/', protect, createJob)

// Get all jobs (admin view or public feed)
router.get('/', protect, getAllJobs)

// Get my jobs (customer)
router.get('/me', protect, getMyJobs)

// Apply to job (worker)
router.post('/:jobId/apply', protect, workerOnly, applyToJob)

// Assign worker (customer or admin)
router.patch('/:jobId/assign', protect, assignWorker)

// Update job status (admin or owner)
router.patch('/:jobId/status', protect, updateJobStatus)

export default router