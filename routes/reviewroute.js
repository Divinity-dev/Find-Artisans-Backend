import express from 'express'

import {
  createReview,
  getWorkerReviews,
  getMyReviews,
  getWorkerRatingBreakdown,
   createWorkerToCustomerReview
} from '../controllers/reviewController.js'

import { protect } from '../Middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createReview)

router.post('/customer-review', protect, createWorkerToCustomerReview)

router.get('/my', protect, getMyReviews)

router.get('/worker/:workerId', getWorkerReviews)

router.get('/worker/:workerId/breakdown', getWorkerRatingBreakdown)

export default router