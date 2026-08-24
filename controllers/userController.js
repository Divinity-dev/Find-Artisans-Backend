// controllers/userController.js

import User from '../models/users.js'
import Job from '../models/jobs.js'
import Review from '../models/review.js' 
import { calculateTrustScore } from '../services/trustscore.js'

// ======================================
// GET LOGGED IN USER
// ======================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    const jobs = await Job.find({ customer: user._id })

    const totalJobs = jobs.length
    const completedJobs = jobs.filter(j => j.status === 'completed').length
    const cancelledJobs = jobs.filter(j => j.status === 'cancelled').length

    const trustScore = calculateTrustScore({
      totalJobs,
      completedJobs,
      cancelledJobs,
      isVerified: user.verification?.isVerified,
    })

    const stats = {
      totalJobs,
      completedJobs,
      cancelledJobs,
      trustScore,
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// UPDATE USER PROFILE
// ======================================
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const {
      fullName,
      email,
      phone,
      profilePhoto,
      about,
      skill,
      hourlyRate,
      skills,
      yearsOfExperience,
      specialization,
      availability,
      location,
    } = req.body

    // ======================================
    // BASIC FIELDS
    // ======================================

    if (fullName) {
      user.fullName = fullName
    }

    if (email) {
      // Check if email already exists
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        })
      }

      user.email = email
    }

    if (phone) {
      user.phone = phone
    }

    if (hourlyRate ) {
      user.hourlyRate = hourlyRate
    }

    if (
  profilePhoto &&
  !profilePhoto.startsWith('blob:')
) {
  user.profilePhoto = profilePhoto
}

    if (about) {
      user.about = about
    }

    // ======================================
    // WORKER FIELDS
    // ======================================

    if (skill) {
      user.skill = skill
    }

    if (skills) {
      user.skills = skills
    }

    if (yearsOfExperience !== undefined) {
      user.yearsOfExperience = yearsOfExperience
    }

    if (specialization) {
      user.specialization = specialization
    }

    if (availability) {
      user.availability = availability
    }

   // ======================================
// LOCATION
// ======================================

if (location) {
  user.location = {
    state:
      location.state || user.location?.state,

    city:
      location.city || user.location?.city,

    localGovernment:
      location.localGovernment ||
      user.location?.localGovernment,

    address:
      location.address ||
      user.location?.address,

    coordinates:
      location.coordinates?.coordinates?.length === 2
        ? {
            type: 'Point',
            coordinates: [
              Number(location.coordinates.coordinates[0]),
              Number(location.coordinates.coordinates[1]),
            ],
          }
        : user.location?.coordinates,
  }
}

    // ======================================
    // SAVE USER
    // ======================================

    const updatedUser = await user.save()

    // Remove password from response
    const userResponse = updatedUser.toObject()
    delete userResponse.password
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// GET SINGLE USER
// ======================================
export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // OPTIONAL: if you have Job model
    const jobs = await Job.find({ customer: user._id }).populate('assignedWorker', 'fullName')

    // OPTIONAL: if you have Review model
    const reviews = await Review.find({ reviewer: user._id })
  .populate('reviewedUser', 'fullName')

    const totalJobs = jobs.length
const completedJobs = jobs.filter(j => j.status === 'completed').length
const cancelledJobs = jobs.filter(j => j.status === 'cancelled').length

const trustScore = calculateTrustScore({
  totalJobs,
  completedJobs,
  cancelledJobs,
  isVerified: user.verification?.isVerified,
})

const stats = {
  totalJobs,
  completedJobs,
  cancelledJobs,
  trustScore,
}

    return res.status(200).json({
  success: true,
  data: {
    user,
    jobs,
    reviews,
    stats,
  },
})
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// GET ALL WORKERS
// ======================================
export const getAllWorkers = async (req, res) => {
  try {
    const {
      skill,
      state,
      city,
      localGovernment,
      latitude,
      longitude,
      radius = 25,
    } = req.query

    const query = {
      role: 'worker',
      isSuspended: false,
      isActive: true,
    }

    // ==============================
    // NORMAL LOCATION FILTERS
    // ==============================

    if (state) {
      query['location.state'] = state
    }

    if (city) {
      query['location.city'] = city
    }

    if (localGovernment) {
      query['location.localGovernment'] = localGovernment
    }

    // ==============================
    // SKILL SEARCH
    // ==============================

    if (skill) {
      query.$or = [
        {
          skill: {
            $regex: skill,
            $options: 'i',
          },
        },
        {
          skills: {
            $regex: skill,
            $options: 'i',
          },
        },
      ]
    }

    // ==============================
    // LOCATION SEARCH
    // ==============================

    const hasCoordinates =
      latitude !== undefined &&
      longitude !== undefined &&
      !Number.isNaN(Number(latitude)) &&
      !Number.isNaN(Number(longitude))

    if (hasCoordinates) {
      const lat = Number(latitude)
      const lng = Number(longitude)
      const radiusInMeters = Number(radius) * 1000

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusInMeters,
        },
      }
    }

    // ==============================
    // GET WORKERS
    // ==============================

    const workers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: workers.length,
      workers,
    })
  } catch (error) {
    console.error('Get all workers error:', error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// UPDATE AVAILABILITY
// ======================================
export const updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const { availability } = req.body

    const allowedStatuses = [
      'available',
      'busy',
      'offline',
    ]

    if (!allowedStatuses.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      })
    }

    user.availability = availability

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      availability: user.availability,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================================
// DELETE ACCOUNT
// ======================================
export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}