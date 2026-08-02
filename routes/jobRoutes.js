import express from 'express'

import {
  createJob,
  getAllJobs,
  getMyJobs,
  applyToJob,
  assignWorker,
  updateJobStatus,
  getSingleJob,
  deleteJob,
  getPublicCustomerProfile,
  getWorkerActiveJobs,
  getWorkerCompletedJobs,
  getPublicWorkerProfile,
} from '../controllers/jobControllers.js'

import {
  protect,
  workerOnly,
  adminOnly,
  customerOnly,
} from '../middleware/authMiddleware.js'

const router = express.Router()

// ======================
// JOBS
// ======================

// Create job (customer)
router.post('/create', protect, createJob)

// Get all jobs (admin view or public feed)
router.get('/', getAllJobs)

// get active jobs for a worker
router.get('/worker/active', protect, workerOnly, getWorkerActiveJobs)

// get completed jobs for a worker
router.get('/worker/completed', protect, workerOnly, getWorkerCompletedJobs)
router.get('/worker/public/:id', getPublicWorkerProfile)

// Get my jobs (customer)
router.get('/me', protect, getMyJobs)

// Apply to job (worker)
router.post('/:jobId/apply', protect, workerOnly, applyToJob)

// Assign worker (customer or admin)
router.patch('/:jobId/assign', protect,customerOnly, assignWorker)

// Update job status (admin or owner)
router.patch('/:jobId/status', protect, updateJobStatus)

// PUBLIC ROUTES FIRST
router.get('/public/:id', getPublicCustomerProfile)

// SINGLE JOB (dynamic last)
router.get('/:jobId', getSingleJob)



// Delete job (admin or owner)
router.delete('/:jobId', protect, deleteJob)

export default router