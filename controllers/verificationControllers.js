import User from '../models/users.js'

// ===============================
// SUBMIT VERIFICATION
// ===============================
export const submitVerification = async (req, res) => {
  try {
    const { nin, governmentId } = req.body

    if (!nin || !governmentId) {
      return res.status(400).json({
        success: false,
        message: 'NIN and Government ID are required',
      })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.verification = {
      nin,
      governmentId,
      isVerified: false,
      verifiedAt: null,
      status: 'pending',
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Verification submitted successfully',
      data: user.verification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// GET MY VERIFICATION STATUS
// ===============================
export const getMyVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: user.verification || {
        nin: null,
        governmentId: null,
        isVerified: false,
        status: 'not_submitted',
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// ADMIN VERIFY USER
// ===============================
export const adminVerifyUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { isVerified } = req.body

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.verification = user.verification || {}

    user.verification.isVerified = isVerified

    user.verification.status = isVerified ? 'verified' : 'rejected'

    user.verification.verifiedAt = isVerified
      ? new Date()
      : null

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Verification updated successfully',
      data: user.verification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
