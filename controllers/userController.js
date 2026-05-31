// controllers/userController.js

import User from '../models/users.js'

// ======================================
// GET LOGGED IN USER
// ======================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    res.status(200).json({
      success: true,
      user,
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

        latitude:
          location.latitude ||
          user.location?.latitude,

        longitude:
          location.longitude ||
          user.location?.longitude,
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
    const user = await User.findById(req.params.id).select(
      '-password'
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      user,
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
    const query = {
      role: 'worker',
      isSuspended: false,
      isActive: true,
    }

    // Optional Filters
    if (req.query.skill) {
      query.skill = req.query.skill
    }

    if (req.query.state) {
      query['location.state'] = req.query.state
    }

    if (req.query.city) {
      query['location.city'] = req.query.city
    }

    if (req.query.localGovernment) {
      query['location.localGovernment'] =
        req.query.localGovernment
    }

    const workers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: workers.length,
      workers,
    })
  } catch (error) {
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