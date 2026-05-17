import express from "express";

import {
  submitVerification,
  getMyVerification,
  adminVerifyUser,
} from "../controllers/verificationController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Upload verification document
router.post(
  "/upload-id",
  protect,
  upload.single("document"),
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        imageUrl: req.file.path,
        public_id: req.file.filename,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Submit verification
router.post("/", protect, submitVerification);

// Get my verification status
router.get("/me", protect, getMyVerification);

// Admin approves/rejects verification
router.patch("/:userId", protect, adminOnly, adminVerifyUser);

export default router;