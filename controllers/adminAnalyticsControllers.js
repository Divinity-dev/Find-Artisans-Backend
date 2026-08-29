import User from '../models/users.js'
import Job from '../models/jobs.js'
import Complaint from '../models/complaints.js'
import mongoose from 'mongoose'
import sendEmail from '../utils/sendEmail.js'

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
// VERIFY / REJECT WORKER
// ======================
export const verifyWorker = async (req, res) => {
  try {
    const { id } = req.params
    const { isVerified } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID',
      })
    }

    const worker = await User.findOne({
      _id: id,
      role: 'worker',
    })

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      })
    }

    if (!worker.verification) {
      worker.verification = {}
    }

    worker.verification.isVerified = Boolean(isVerified)

    if (isVerified) {
      worker.verification.verifiedAt = new Date()
    } else {
      worker.verification.verifiedAt = null
    }

    await worker.save()

    return res.status(200).json({
      success: true,
      message: isVerified
        ? 'Worker verified successfully'
        : 'Worker verification rejected',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ======================
// DELETE / REJECT VERIFICATION
// ======================
export const deleteVerificationRequest = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID',
      })
    }

    const worker = await User.findOne({
      _id: id,
      role: 'worker',
    })

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      })
    }

    if (!worker.verification) {
      return res.status(404).json({
        success: false,
        message: 'No verification request found',
      })
    }

    // Remove only the verification data.
    // The worker account remains intact.
    worker.verification = undefined

    await worker.save()

    return res.status(200).json({
      success: true,
      message: 'Verification request rejected successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
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

// ======================
// SEND ADMIN EMAIL
// ======================
export const sendAdminEmail = async (req, res) => {
  try {
    const {
      audience,
      subject,
      message,
    } = req.body

    // ======================
    // VALIDATION
    // ======================

    if (!audience) {
      return res.status(400).json({
        success: false,
        message: 'Please select an audience',
      })
    }

    if (!['workers', 'customers', 'everyone'].includes(audience)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid audience',
      })
    }

    if (!subject?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email subject is required',
      })
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email message is required',
      })
    }

    // ======================
    // DETERMINE RECIPIENTS
    // ======================

    let userQuery = {}

    if (audience === 'workers') {
      userQuery = {
        role: 'worker',
      }
    }

    if (audience === 'customers') {
      userQuery = {
        role: 'customer',
      }
    }

    if (audience === 'everyone') {
      userQuery = {
        role: {
          $in: ['worker', 'customer'],
        },
      }
    }

    // ======================
    // GET USERS
    // ======================

    const users = await User.find(userQuery)
      .select('email fullName')

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No recipients found',
      })
    }

    // ======================
    // CREATE EMAIL HTML
    // ======================

    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #111827;
        "
      >
        <h2>FindArtisans</h2>

        <p>
          ${message.replace(/\n/g, '<br />')}
        </p>

        <br />

        <p>
          Regards,<br />
          <strong>FindArtisans Team</strong>
        </p>
      </div>
    `

    // ======================
    // SEND EMAILS
    // ======================

    let sent = 0
    let failed = 0

    for (const user of users) {
      try {
        await sendEmail(
          user.email,
          subject.trim(),
          html
        )

        sent++
      } catch (emailError) {
        failed++

        console.error(
          `Failed to send email to ${user.email}:`,
          emailError.message
        )
      }
    }

    // ======================
    // RESPONSE
    // ======================

    return res.status(200).json({
      success: true,
      message: 'Email campaign completed',
      stats: {
        totalRecipients: users.length,
        sent,
        failed,
      },
    })

  } catch (error) {
    console.error(
      'Admin email error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}