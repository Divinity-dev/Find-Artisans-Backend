import Job from '../models/jobs.js'
import mongoose from 'mongoose'
import User from '../models/users.js'
import {calculateTrustScore} from '../services/trustscore.js'

// ===============================
// CREATE JOB
// ===============================
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      location,
      images,
      customerName,
      phone,
      urgency,
    } = req.body;

    const message = req.body?.message || ''

    if (!title || !description || !location?.state) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required',
      });
    }

    const job = await Job.create({
      title,
      description,
      category,
      budget,
      images,
      location: {
        state: location.state,
        city: location.city,
        localGovernment: location.localGovernment,
        address: location.address,
      },
      customer: req.user._id,
      urgency,
      customerName,
      phone,
    });

    return res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL JOBS (ADMIN + USER SAFE)
// ===============================
export const getAllJobs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const total = await Job.countDocuments()

    const jobs = await Job.find()
      .populate('customer', 'fullName phone')
      .populate('assignedWorker', 'fullName skill')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      data: jobs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// GET MY JOBS
// ===============================
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.user._id })
      .populate('assignedWorker', 'fullName profilePhoto rating')
      .populate('applicants.worker', 'fullName profilePhoto rating')
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      data: jobs,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

export const applyToJob = async (req, res) => {
  try {
    const message = req.body?.message || ''

    const job = await Job.findById(req.params.jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    if (req.user.role !== 'worker') {
  return res.status(403).json({
    success: false,
    message: 'Only workers can apply'
  })
}

    const alreadyApplied = job.applicants.some(
      (applicant) =>
        applicant.worker.toString() === req.user._id.toString()
    )

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You already applied for this job',
      })
    }

    job.applicants.push({
      worker: req.user._id,
      message: message || '',
      appliedAt: new Date(),
    })

    await job.save()

    res.status(200).json({
      success: true,
      message: 'Applied successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// GET /api/jobs/:jobId

export const getSingleJob = async (req, res) => {
  try {
    const { jobId } = req.params

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID',
      })
    }

    const job = await Job.findById(jobId)
      .populate('customer', 'fullName profilePhoto phone location verification createdAt')
      .populate('assignedWorker', 'fullName profilePhoto skill')

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    // ✅ SAFE: only if logged in
    const userId = req.user?._id?.toString()

    const hasApplied = userId
      ? job.applicants?.some(
          a => a.worker?.toString() === userId
        )
      : false

    return res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        hasApplied,
        applicantCount: job.applicants?.length || 0,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
    })
  }
}

// ===============================
// ASSIGN WORKER
// ===============================
export const assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'workerId is required',
      })
    }

    const job = await Job.findById(req.params.jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    job.assignedWorker = workerId
    job.status = 'assigned'

    await job.save()

    res.status(200).json({
      success: true,
      message: 'Worker assigned successfully',
      data: job,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// UPDATE JOB STATUS
// ===============================
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatus = [
      'open',
      'assigned',
      'in-progress',
      'completed',
      'cancelled',
    ]

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
    }

    const job = await Job.findById(req.params.jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    job.status = status

    await job.save()

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
// ===============================
// Admin delete
// ===============================
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    // only owner OR admin can delete
    const isOwner =
      job.customer.toString() === req.user._id.toString()

    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      })
    }

    await job.deleteOne()

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


// ===============================
// PUBLIC CUSTOMER PROFILE
// ===============================
export const getPublicCustomerProfile = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    const customer = await User.findById(id).select(
      'fullName profilePhoto location createdAt verification'
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
    }

    const jobs = await Job.find({
      customer: id,
      status: 'completed',
    })
      .select('title category createdAt location assignedWorker')
      .populate('assignedWorker', 'fullName profilePhoto rating')
      .sort({ createdAt: -1 })
      .lean()

    const totalJobs = await Job.countDocuments({ customer: id })
    const completedJobs = await Job.countDocuments({
      customer: id,
      status: 'completed',
    })
    const cancelledJobs = await Job.countDocuments({
      customer: id,
      status: 'cancelled',
    })

    const trustScore = calculateTrustScore({
      totalJobs,
      completedJobs,
      cancelledJobs,
      isVerified: customer?.verification?.isVerified, // ✅ FIXED
    })

    return res.status(200).json({
      success: true,
      data: {
        customer,
        stats: {
          totalJobs,
          completedJobs,
          cancelledJobs,
          trustScore: Number(trustScore.toFixed(1)),
        },
        jobs,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// get active jobs
// ===============================

export const getWorkerActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      assignedWorker: req.params.id,
      status: { $in: ['assigned', 'in-progress'] }
    })
      .populate('customer', 'fullName phone')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: jobs
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ===============================
// get completed jobs for worker
// ===============================
export const getWorkerCompletedJobs = async (req, res) => {
  try {
    const { id } = req.user;

    const jobs = await Job.find({
      assignedWorker: id,
      status: 'completed',
    })
      .populate('customer', 'fullName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// get completed jobs for worker(public)
// ===============================

export const getPublicWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID',
      });
    }

    const worker = await User.findById(id).select(
      'fullName profilePhoto skill location bio yearsOfExperience rating verification'
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    const jobs = await Job.find({
      assignedWorker: id,
      status: 'completed',
    })
      .select('title description budget createdAt customer')
      .populate('customer', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        worker,
        jobs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};