import mongoose from 'mongoose'

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export default portfolioSchema