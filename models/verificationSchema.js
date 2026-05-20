import mongoose from 'mongoose'

const verificationSchema = new mongoose.Schema(
  {
    nin: {
      type: String,
      trim: true,
    },

    governmentId: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    _id: false,
  }
)

export default verificationSchema