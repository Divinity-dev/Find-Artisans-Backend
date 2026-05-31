import User from '../models/users.js'

// ===============================
// GET MY PORTFOLIO
// ===============================
export const getMyPortfolio = async (req, res) => {
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
      data: user.portfolio || [],
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// ADD PORTFOLIO ITEM
// ===============================
export const addPortfolioItem = async (req, res) => {
  try {
    const { title, location, image, description } = req.body

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.portfolio = user.portfolio || []

    user.portfolio.push({
      title,
      location: location || '',
      image: image || '',
      description,
    })

    await user.save()

    return res.status(201).json({
      success: true,
      message: 'Portfolio item added',
      data: user.portfolio,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// UPDATE PORTFOLIO ITEM
// ===============================
export const updatePortfolioItem = async (req, res) => {
  try {
    const { portfolioId } = req.params

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const item = user.portfolio?.id(portfolioId)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found',
      })
    }

    const { title, location, image, description } = req.body

    if (title !== undefined) item.title = title
    if (location !== undefined) item.location = location
    if (image !== undefined) item.image = image
    if (description !== undefined) item.description = description

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Portfolio updated',
      data: user.portfolio,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// DELETE PORTFOLIO ITEM
// ===============================
export const deletePortfolioItem = async (req, res) => {
  try {
    const { portfolioId } = req.params

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const item = user.portfolio?.id(portfolioId)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found',
      })
    }

    item.deleteOne()
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Portfolio deleted',
      data: user.portfolio,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}