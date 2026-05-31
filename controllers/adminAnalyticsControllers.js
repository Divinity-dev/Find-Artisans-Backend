import User from '../models/users.js'
import Job from '../models/jobs.js'
import Complaint from '../models/complaints.js'

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
      role: 'worker',
      'verification.isVerified': false,
      'verification.nin': { $exists: true },
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