import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
  type: String,
  enum: ['pending', 'reviewed', 'resolved', 'rejected'],
  default: 'pending'
},
  },
  { timestamps: true }
)

export default mongoose.model('Complaint', complaintSchema)