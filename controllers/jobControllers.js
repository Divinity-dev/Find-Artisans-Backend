import Job from '../models/jobs.js'

// CREATE JOB
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      customer: req.user._id,
    })

    res.status(201).json({
      success: true,
      job,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// GET ALL JOBS
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('customer', 'fullName phone')
      .populate('assignedWorker', 'fullName skill')

    res.status(200).json({
      success: true,
      jobs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// GET MY JOBS
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.user._id })

    res.status(200).json({
      success: true,
      jobs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// APPLY TO JOB
export const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)

    job.applicants.push({
      worker: req.user._id,
      message: req.body.message,
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

// ASSIGN WORKER
export const assignWorker = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)

    job.assignedWorker = req.body.workerId
    job.status = 'assigned'

    await job.save()

    res.status(200).json({
      success: true,
      message: 'Worker assigned',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// UPDATE JOB STATUS
export const updateJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)

    job.status = req.body.status

    await job.save()

    res.status(200).json({
      success: true,
      message: 'Job updated',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}