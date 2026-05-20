import User from '../models/users.js'
import Job from '../models/jobs.js'
import Complaint from '../models/complaints.js'

// ======================================
// DASHBOARD STATS
// ======================================
export const getDashboardStats = async (req, res) => {
  try {
    const workers = await User.countDocuments({ role: 'worker' })
    const customers = await User.countDocuments({ role: 'customer' })

    const totalJobs = await Job.countDocuments()

    const completedJobs = await Job.countDocuments({
      status: 'completed',
    })

    const pendingVerifications = await User.countDocuments({
      'verification.isVerified': false,
      'verification.nin': { $exists: true },
    })

    const pendingComplaints = await Complaint.countDocuments({
      status: 'pending',
    })

    // SIMPLE REVENUE MODEL (placeholder logic)
    // You will replace this later with real payments
    const revenue = completedJobs * 3500

    res.status(200).json({
      success: true,
      stats: {
        workers,
        customers,
        totalJobs,
        completedJobs,
        pendingVerifications,
        pendingComplaints,
        revenue,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getVerificationQueue = async (req, res) => {
  try {
    const workers = await User.find({
      role: 'worker',
      'verification.isVerified': false,
      'verification.nin': { $exists: true },
    }).select('fullName skill location verification')

    res.status(200).json({
      success: true,
      pendingVerifications: workers,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getComplaintOverview = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('customer', 'fullName')
      .populate('worker', 'fullName skill')
      .populate('job', 'title status')
      .sort({ createdAt: -1 })

    const summary = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      investigating: complaints.filter(c => c.status === 'investigating').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
    }

    res.status(200).json({
      success: true,
      summary,
      complaints,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getJobOverview = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('customer', 'fullName')
      .populate('assignedWorker', 'fullName skill')
      .sort({ createdAt: -1 })

    const summary = {
      total: jobs.length,
      open: jobs.filter(j => j.status === 'open').length,
      assigned: jobs.filter(j => j.status === 'assigned').length,
      inProgress: jobs.filter(j => j.status === 'in-progress').length,
      completed: jobs.filter(j => j.status === 'completed').length,
    }

    res.status(200).json({
      success: true,
      summary,
      jobs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}