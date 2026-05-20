import User from '../models/users.js'

// SUBMIT VERIFICATION
export const submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const { nin, governmentId } = req.body

    user.verification = {
      nin,
      governmentId,
      isVerified: false,
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Verification submitted',
      verification: user.verification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// GET MY VERIFICATION STATUS
export const getMyVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      verification: user.verification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ADMIN VERIFY USER
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

    user.verification.isVerified = isVerified

    if (isVerified) {
      user.verification.verifiedAt = new Date()
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Verification updated',
      verification: user.verification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}