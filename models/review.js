import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: String,
  },
  { timestamps: true }
)

reviewSchema.index(
  { job: 1, customer: 1 },
  { unique: true }
)

export default mongoose.model('Review', reviewSchema)