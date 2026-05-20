import User from '../models/users.js'

// GET MY PORTFOLIO
export const getMyPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      portfolio: user.portfolio,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ADD PORTFOLIO ITEM
export const addPortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const { title, location, image, description } = req.body

    user.portfolio.push({
      title,
      location,
      image,
      description,
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'Portfolio item added',
      portfolio: user.portfolio,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// UPDATE PORTFOLIO ITEM
export const updatePortfolioItem = async (req, res) => {
  try {
    const { portfolioId } = req.params

    const user = await User.findById(req.user._id)

    const item = user.portfolio.id(portfolioId)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found',
      })
    }

    const { title, location, image, description } = req.body

    if (title) item.title = title
    if (location) item.location = location
    if (image) item.image = image
    if (description) item.description = description

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Portfolio updated',
      portfolio: user.portfolio,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// DELETE PORTFOLIO ITEM
export const deletePortfolioItem = async (req, res) => {
  try {
    const { portfolioId } = req.params

    const user = await User.findById(req.user._id)

    const item = user.portfolio.id(portfolioId)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found',
      })
    }

    item.deleteOne()

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}