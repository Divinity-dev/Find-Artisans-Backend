import Complaint from '../models/complaints.js'

// ===============================
// CREATE COMPLAINT
// ===============================
export const createComplaint = async (req, res) => {
  try {
    const { title, description, worker, job } = req.body

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      })
    }

    const complaint = await Complaint.create({
      title,
      description,
      worker: worker || null,
      job: job || null,
      customer: req.user._id,
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// GET MY COMPLAINTS
// ===============================
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      customer: req.user._id,
    })
      .populate('worker', 'fullName skill')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: complaints,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// GET ALL COMPLAINTS (ADMIN)
// ===============================
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
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ===============================
// UPDATE COMPLAINT STATUS
// ===============================
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatus = [
      'pending',
      'reviewed',
      'resolved',
      'rejected',
    ]

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      })
    }

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      })
    }

    complaint.status = status

    await complaint.save()

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint updated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}