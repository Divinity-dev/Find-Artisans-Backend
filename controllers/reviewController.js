import Review from '../models/review.js'
import Job from '../models/jobs.js'
import User from '../models/users.js'

// ======================================
// CREATE REVIEW (CUSTOMER ONLY)
// ======================================
export const createReview = async (req, res) => {
  try {
    const customerId = req.user._id
    const { workerId, jobId, rating, comment } = req.body

    // 1. Validate job exists
    const job = await Job.findById(jobId)

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      })
    }

    // 2. Ensure customer owns the job
    if (job.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        message: 'Not authorized for this job',
      })
    }

    // 3. Ensure job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({
        message: 'Job is not completed yet',
      })
    }

    // 4. Prevent duplicate review
    const existingReview = await Review.findOne({
      job: jobId,
      customer: customerId,
    })

    if (existingReview) {
      return res.status(400).json({
        message: 'You already reviewed this job',
      })
    }

    // 5. Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      })
    }

    // 6. Create review
    const review = await Review.create({
      worker: workerId,
      customer: customerId,
      job: jobId,
      rating,
      comment,
    })

    // 7. Recalculate worker stats
    const stats = await Review.aggregate([
      { $match: { worker: job.worker } },
      {
        $group: {
          _id: '$worker',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ])

    const completedJobs = await Job.countDocuments({
      worker: job.worker,
      status: 'completed',
    })

    if (stats.length > 0) {
      await User.findByIdAndUpdate(job.worker, {
        rating: stats[0].avgRating,
        totalReviews: stats[0].count,
        completedJobs,
      })
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// ======================================
// GET REVIEWS FOR A WORKER
// ======================================
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params

    const reviews = await Review.find({
      worker: workerId,
    })
      .populate('customer', 'fullName profilePhoto')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    res.status(200).json({
      reviews,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// ======================================
// GET MY REVIEWS (AS CUSTOMER)
// ======================================
export const getMyReviews = async (req, res) => {
  try {
    const customerId = req.user._id

    const reviews = await Review.find({
      customer: customerId,
    })
      .populate('worker', 'fullName skill rating')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    res.status(200).json({
      reviews,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// ======================================
// GET WORKER RATING BREAKDOWN (NEW)
// ======================================
export const getWorkerRatingBreakdown = async (req, res) => {
  try {
    const { workerId } = req.params

    const breakdown = await Review.aggregate([
      { $match: { worker: workerId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ])

    res.status(200).json({
      breakdown,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}