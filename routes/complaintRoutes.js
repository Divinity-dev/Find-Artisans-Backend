import express from 'express'
import {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
} from '../controllers/complaintController.js'

import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createComplaint)

router.get('/', protect, adminOnly, getAllComplaints)

router.patch('/:id', protect, adminOnly, updateComplaintStatus)

export default router