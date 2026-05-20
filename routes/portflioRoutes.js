// routes/portfolioRoutes.js

import express from 'express'
import {
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getMyPortfolio,
} from '../controllers/portfolioControllers.js'

import { protect, workerOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get logged-in worker portfolio
router.get('/me', protect, workerOnly, getMyPortfolio)

// Add portfolio item
router.post('/', protect, workerOnly, addPortfolioItem)

// Update portfolio item
router.patch('/:portfolioId', protect, workerOnly, updatePortfolioItem)

// Delete portfolio item
router.delete('/:portfolioId', protect, workerOnly, deletePortfolioItem)

export default router