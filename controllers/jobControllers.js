import Job from '../models/jobs.js'

// ===============================
// CREATE JOB
// ===============================
export const createJob = async (req, res) => {
  try {
    const { title, description, location, budget } = req.body

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required',
      })
    }

    const job = await Job.create({
      title,
      description,
      location,
      budget: budget || 0,
      customer: req.user._id,
      status: 'open', // FIXED (was "pending" but not in schema)
      applicants: [],
    })

    res.status(201).json({
      success: true,
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
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: jobs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// APPLY TO JOB
// ===============================
export const applyToJob = async (req, res) => {
  try {
    const { message } = req.body

    const job = await Job.findById(req.params.jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    if (!job.applicants) {
      job.applicants = []
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