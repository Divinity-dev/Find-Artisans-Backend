import mongoose from 'mongoose'

const verificationSchema = new mongoose.Schema(
  {
    nin: {
      type: String,
      trim: true,
    },

    governmentId: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
)

export default verificationSchema