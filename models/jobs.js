import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String, // e.g electrician, plumber
      required: true,
    },

    budget: {
      type: Number,
    },

    location: {
      state: String,
      city: String,
      address: String,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: [
        'open',
        'assigned',
        'in-progress',
        'completed',
        'cancelled',
      ],
      default: 'open',
    },

    applicants: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Job', jobSchema)