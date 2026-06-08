import mongoose from 'mongoose'
import Review from '../models/review.js'
import Job from '../models/jobs.js'
import User from '../models/users.js'

/**
 * ===============================
 * CREATE REVIEW (CUSTOMER → WORKER)
 * ===============================
 */
export const createReview = async (req, res) => {
  try {
    const customerId = req.user._id
    const { jobId, rating, comment } = req.body

    // 1. Validate input
    if (!jobId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'jobId and rating are required',
      })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      })
    }

    // 2. Find job
    const job = await Job.findById(jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    // 3. Ensure ownership
    if (job.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this job',
      })
    }

    // 4. Must be completed
    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Job must be completed before review',
      })
    }

    // 5. Prevent duplicates
    const existingReview = await Review.findOne({
      job: jobId,
      customer: customerId,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this job',
      })
    }

    const workerId = job.assignedWorker

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'No worker assigned to this job',
      })
    }

    // 6. CREATE REVIEW (correct schema)
   const review = await Review.create({
  reviewer: customerId,
  reviewedUser: workerId,
  job: jobId,
  rating,
  comment: comment || '',
  reviewType: 'customer_to_worker',
})

    // 7. Recalculate worker stats (FIXED)
    const stats = await Review.aggregate([
      {
        $match: {
          reviewedUser: new mongoose.Types.ObjectId(workerId),
          reviewType: 'customer_to_worker',
        },
      },
      {
        $group: {
          _id: '$worker',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ])

    const completedJobs = await Job.countDocuments({
      assignedWorker: workerId,
      status: 'completed',
    })

    if (stats.length > 0) {
      await User.findByIdAndUpdate(workerId, {
        rating: stats[0].avgRating,
        totalReviews: stats[0].totalReviews,
        completedJobs,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * ===============================
 * GET WORKER REVIEWS
 * ===============================
 */
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params

    const reviews = await Review.find({
      reviewedUser: workerId,
      reviewType: 'customer_to_worker',
    })
      .populate('reviewer', 'fullName profilePhoto')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    const stats = await Review.aggregate([
      {
        $match: {
          reviewedUser: new mongoose.Types.ObjectId(workerId),
          reviewType: 'customer_to_worker',
        },
      },
      {
        $group: {
          _id: '$reviewedUser',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      reviews,
      stats: stats[0] || { avgRating: 0, totalReviews: 0 },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * ===============================
 * GET MY REVIEWS (CUSTOMER)
 * ===============================
 */
export const getMyReviews = async (req, res) => {
  try {
    const customerId = req.user._id

    const reviews = await Review.find({
      customer: customerId,
    })
      .populate('worker', 'fullName skill rating profilePhoto')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      reviews,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * ===============================
 * GET RATING BREAKDOWN
 * ===============================
 */
export const getWorkerRatingBreakdown = async (req, res) => {
  try {
    const { workerId } = req.params

    const breakdown = await Review.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ])

    return res.status(200).json({
      success: true,
      breakdown,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * ===============================
 * WORKER → CUSTOMER REVIEW (NEW FEATURE)
 * ===============================
 */
export const createWorkerToCustomerReview = async (req, res) => {
  try {
    const workerId = req.user._id
    const { jobId, rating, comment } = req.body

    if (!jobId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'jobId and rating are required',
      })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      })
    }

    const job = await Job.findById(jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    if (
      !job.assignedWorker ||
      job.assignedWorker.toString() !== workerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this job',
      })
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Job must be completed before review',
      })
    }

    const existing = await Review.findOne({
      job: jobId,
      reviewer: workerId,
      reviewType: 'worker_to_customer',
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already reviewed this customer',
      })
    }

    const review = await Review.create({
      reviewer: workerId,
      reviewedUser: job.customer,
      job: jobId,
      rating,
      comment: comment || '',
      reviewType: 'worker_to_customer',
    })

    return res.status(201).json({
      success: true,
      message: 'Customer reviewed successfully',
      data: review,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}