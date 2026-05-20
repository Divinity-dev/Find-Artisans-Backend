import mongoose from 'mongoose'
import verificationSchema from './verificationSchema.js'
import portfolioSchema from './portfolio.js'


const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['customer', 'worker', 'admin'],
      default: 'customer',
    },

   location: {
  state: {
    type: String,
    trim: true,
  },

  city: {
    type: String,
    trim: true,
  },

  localGovernment: {
    type: String,
    trim: true,
  },

  address: {
    type: String,
    trim: true,
  },
},

    about: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Worker specific fields
    skill: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    specialization: {
      type: String,
      trim: true,
    },

    portfolio: [portfolioSchema],

    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },

    // Ratings & Trust
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    trustScore: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    // Verification
    verification: verificationSchema,

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userSchema)


