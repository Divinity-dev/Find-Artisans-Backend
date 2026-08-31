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
  user.location.state =
    location.state ?? user.location?.state ?? ''

  user.location.city =
    location.city ?? user.location?.city ?? ''

  user.location.localGovernment =
    location.localGovernment ??
    user.location?.localGovernment ??
    ''

  if (location.address !== undefined) {
    user.location.address = location.address
  }

  // Only update coordinates when valid coordinates
  // are actually supplied.
  if (
    Array.isArray(location.coordinates?.coordinates) &&
    location.coordinates.coordinates.length === 2
  ) {
    const longitude = Number(
      location.coordinates.coordinates[0]
    )

    const latitude = Number(
      location.coordinates.coordinates[1]
    )

    if (
      Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    ) {
      user.location.coordinates = {
        type: 'Point',
        coordinates: [
          longitude,
          latitude,
        ],
      }
    }
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


// GET ALL WORKERS
// SERVER-SIDE FILTERING + PAGINATION
// ======================================
export const getAllWorkers = async (req, res) => {
  try {
    const {
      search,
      skill,
      state,
      city,
      localGovernment,
      latitude,
      longitude,
      radius = 25,
      page = 1,
      limit = 12,
    } = req.query

    // ======================================
    // PAGINATION
    // ======================================

    const currentPage = Math.max(
      1,
      Number.parseInt(page, 10) || 1
    )

    const itemsPerPage = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(limit, 10) || 12
      )
    )

    const skip =
      (currentPage - 1) * itemsPerPage

    // ======================================
    // BASIC WORKER QUERY
    // ======================================

    const query = {
      role: 'worker',
      isSuspended: false,
      isActive: true,
    }

    // ======================================
    // LOCATION FILTERS
    // ======================================

    if (state) {
      query['location.state'] = state
    }

    if (city) {
      query['location.city'] = city
    }

    if (localGovernment) {
      query['location.localGovernment'] =
        localGovernment
    }

    // ======================================
    // SEARCH
    // Searches:
    // - fullName
    // - skill
    // - skills
    // ======================================

    const searchValue =
      search?.trim() || skill?.trim()

    if (searchValue) {
      query.$or = [
        {
          fullName: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          skill: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          skills: {
            $regex: searchValue,
            $options: 'i',
          },
        },
      ]
    }

    // ======================================
    // CHECK GEOLOCATION
    // ======================================

    const hasCoordinates =
      latitude !== undefined &&
      longitude !== undefined &&
      !Number.isNaN(Number(latitude)) &&
      !Number.isNaN(Number(longitude))

    // ======================================
    // NEARBY SEARCH
    // ======================================

    if (hasCoordinates) {
      const lat = Number(latitude)
      const lng = Number(longitude)

      const radiusInMeters =
        Number(radius) * 1000

      const geoQuery = {
        role: 'worker',
        isSuspended: false,
        isActive: true,
      }

      // --------------------------------------
      // LOCATION FILTERS
      // --------------------------------------

      if (state) {
        geoQuery['location.state'] = state
      }

      if (city) {
        geoQuery['location.city'] = city
      }

      if (localGovernment) {
        geoQuery['location.localGovernment'] =
          localGovernment
      }

      // --------------------------------------
      // SEARCH
      // --------------------------------------

      if (searchValue) {
        geoQuery.$or = [
          {
            fullName: {
              $regex: searchValue,
              $options: 'i',
            },
          },
          {
            skill: {
              $regex: searchValue,
              $options: 'i',
            },
          },
          {
            skills: {
              $regex: searchValue,
              $options: 'i',
            },
          },
        ]
      }

      // --------------------------------------
      // GEO SEARCH
      // --------------------------------------

      const results =
        await User.aggregate([
          {
  $geoNear: {
    near: {
      type: 'Point',
      coordinates: [lng, lat],
    },

    key: 'location.coordinates',

    distanceField: 'distance',

    maxDistance: radiusInMeters,

    spherical: true,

    query: geoQuery,
  },
},

{
  $project: {
    password: 0,
  },
},

          {
            $facet: {
              metadata: [
                {
                  $count: 'total',
                },
              ],

              workers: [
                {
                  $skip: skip,
                },
                {
                  $limit: itemsPerPage,
                },
              ],
            },
          },
        ])

      const result = results[0] || {
        metadata: [],
        workers: [],
      }

      const total =
        result.metadata[0]?.total || 0

      const totalPages = Math.max(
        1,
        Math.ceil(total / itemsPerPage)
      )

      return res.status(200).json({
        success: true,
        total,
        totalPages,
        currentPage,
        limit: itemsPerPage,
        workers: result.workers,
      })
    }

    // ======================================
    // NORMAL SEARCH
    // ======================================

    const [workers, total] =
      await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(itemsPerPage),

        User.countDocuments(query),
      ])

    // ======================================
    // TOTAL PAGES
    // ======================================

    const totalPages = Math.max(
      1,
      Math.ceil(total / itemsPerPage)
    )

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,
      total,
      totalPages,
      currentPage,
      limit: itemsPerPage,
      workers,
    })
  } catch (error) {
    console.error(
      'Get all workers error:',
      error
    )

    return res.status(500).json({
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

// ======================================
// UPDATE MY CURRENT LOCATION
// ======================================
export const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body

    const lat = Number(latitude)
    const lng = Number(longitude)

    // ======================================
    // VALIDATE COORDINATES
    // ======================================

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid latitude and longitude are required',
      })
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude',
      })
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude',
      })
    }

    // ======================================
    // FIND USER
    // ======================================

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // ======================================
    // PERSIST GPS LOCATION
    // ======================================

    user.location = {
      ...(user.location?.toObject?.() || user.location || {}),

      coordinates: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    }

    await user.save()

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',

      coordinates: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    })
  } catch (error) {
    console.error(
      'Update location error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}