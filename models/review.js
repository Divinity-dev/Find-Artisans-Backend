import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    // WHO IS WRITING THE REVIEW
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // WHO IS BEING REVIEWED
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // LINKED JOB
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // SCORE
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // OPTIONAL COMMENT
    comment: {
      type: String,
      default: '',
      trim: true,
    },

    // TYPE OF REVIEW
    reviewType: {
      type: String,
      enum: ['worker_to_customer', 'customer_to_worker'],
      required: true,
    },
  },
  { timestamps: true }
)


// ✅ FIXED: prevent duplicate reviews properly
reviewSchema.index(
  { job: 1, reviewer: 1, reviewType: 1 },
  { unique: true, name: 'unique_review_per_job_per_user_type' }
)

export default mongoose.model('Review', reviewSchema)