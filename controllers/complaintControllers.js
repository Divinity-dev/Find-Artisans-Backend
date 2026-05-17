import Complaint from '../models/Complaint.js'

// CREATE COMPLAINT
export const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      customer: req.user._id,
    })

    res.status(201).json({
      success: true,
      complaint,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// GET ALL COMPLAINTS (ADMIN)
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('customer', 'fullName')
      .populate('worker', 'fullName skill')
      .populate('job', 'title')

    res.status(200).json({
      success: true,
      complaints,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// UPDATE STATUS
export const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)

    complaint.status = req.body.status

    await complaint.save()

    res.status(200).json({
      success: true,
      message: 'Complaint updated',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}