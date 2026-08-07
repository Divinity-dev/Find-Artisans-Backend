import User from '../models/users.js'
import Job from '../models/jobs.js'
import Complaint from '../models/complaints.js'
import mongoose from 'mongoose'

// ======================
// ADMIN DELETION CONTROLLERS
// ======================
export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot delete their own account through this route',
      })
    }

    await Promise.all([
      Job.deleteMany({ customer: user._id }),
      Job.deleteMany({ assignedWorker: user._id }),
      Complaint.deleteMany({ customer: user._id }),
      Complaint.deleteMany({ worker: user._id }),
      user.deleteOne(),
    ])

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const deleteAdminJob = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID',
      })
    }

    const job = await Job.findById(id)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    await Promise.all([
      Complaint.deleteMany({ job: job._id }),
      job.deleteOne(),
    ])

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const deleteAdminComplaint = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID',
      })
    }

    const complaint = await Complaint.findById(id)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      })
    }

    await complaint.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================
// DASHBOARD STATS
// ======================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      workers,
      customers,
      totalJobs,
      completedJobs,
      pendingVerifications,
      pendingComplaints,
    ] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'customer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'completed' }),
      User.countDocuments({
        role: 'worker',
        'verification.isVerified': false,
        'verification.nin': { $exists: true },
      }),
      Complaint.countDocuments({ status: 'pending' }),
    ])

    res.json({
      success: true,
      data: {
        workers,
        customers,
        totalJobs,
        completedJobs,
        pendingVerifications,
        pendingComplaints,
        revenue: completedJobs * 3500,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// VERIFICATION QUEUE (PAGINATED)
// ======================
export const getVerificationQueue = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const query = {
  "verification.isVerified": false,
  "verification.nin": { $exists: true },
}

    const total = await User.countDocuments(query)

    const data = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')

    res.json({
      success: true,
      data,
      meta: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// VERIFY WORKER
// ======================
export const verifyWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id)

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      })
    }

    if (!worker.verification) {
      worker.verification = {}
    }

    worker.verification.isVerified = true
    worker.verification.verifiedAt = new Date()

    await worker.save()

    res.json({
      success: true,
      message: 'Worker verified',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// WORKERS (PAGINATED)
// ======================
export const getWorkers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const total = await User.countDocuments({ role: 'worker' })

    const data = await User.find({ role: 'worker' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')

    res.json({
      success: true,
      data,
      meta: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// CUSTOMERS (PAGINATED)
// ======================
export const getCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const total = await User.countDocuments({ role: 'customer' })

    const data = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')

    res.json({
      success: true,
      data,
      meta: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// JOBS (ADMIN VIEW)
// ======================
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('customer', 'fullName')
      .populate('assignedWorker', 'fullName skill')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: jobs,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ======================
// COMPLAINTS (ADMIN VIEW)
// ======================
export const getComplaints = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const total = await Complaint.countDocuments()

    const data = await Complaint.find()
      .populate('customer', 'fullName')
      .populate('worker', 'fullName skill')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      data,
      meta: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}