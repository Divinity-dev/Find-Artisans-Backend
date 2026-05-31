import express from 'express'

import {
  createReview,
  getWorkerReviews,
  getMyReviews,
  getWorkerRatingBreakdown,
} from '../controllers/reviewController.js'

import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createReview)

router.get('/my', protect, getMyReviews)

router.get('/worker/:workerId', getWorkerReviews)

router.get('/worker/:workerId/breakdown', getWorkerRatingBreakdown)

export default router