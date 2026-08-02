import express from "express";

import {
  submitVerification,
  getMyVerification,
  adminVerifyUser,
} from "../controllers/verificationControllers.js";

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
      console.log("FILE:", req.file)

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        })
      }

      const imageUrl =
        req.file.path ||
        req.file.secure_url ||
        req.file.location // fallback safety

      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: "Upload succeeded but no image URL returned",
        })
      }

      return res.status(200).json({
        success: true,
        imageUrl,
        public_id: req.file.filename,
      })
    } catch (error) {
      console.log("UPLOAD ERROR:", error)

      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
)

// Submit verification
router.post("/", protect, submitVerification);

// Get my verification status
router.get("/me", protect, getMyVerification);

// Admin approves/rejects verification
router.patch("/:userId", protect, adminOnly, adminVerifyUser);

export default router;