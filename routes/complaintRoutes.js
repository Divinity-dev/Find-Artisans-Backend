import express from 'express'

import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  getMyComplaints,
} from '../controllers/complaintControllers.js'

import {
  protect,
  adminOnly,
} from '../Middleware/authMiddleware.js'

const router = express.Router()

// Customer
router.post('/', protect, createComplaint)
router.get('/my', protect, getMyComplaints)

// Admin
router.get('/', protect, adminOnly, getComplaints)
router.patch('/:id', protect, adminOnly, updateComplaintStatus)

export default router