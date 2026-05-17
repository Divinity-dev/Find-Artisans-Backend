import express from 'express'
import {
  createJob,
  getAllJobs,
  getMyJobs,
  applyToJob,
  assignWorker,
  updateJobStatus,
} from '../controllers/jobController.js'

import { protect, workerOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Create job (customer)
router.post('/', protect, createJob)

// Get all jobs
router.get('/', getAllJobs)

// Get my jobs (customer)
router.get('/me', protect, getMyJobs)

// Apply to job (worker)
router.post('/:jobId/apply', protect, workerOnly, applyToJob)

// Assign worker (customer/admin)
router.patch('/:jobId/assign', protect, assignWorker)

// Update job status
router.patch('/:jobId/status', protect, updateJobStatus)

export default router