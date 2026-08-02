import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Allowed MIME types (BEST PRACTICE)
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "artisan-platform/verifications",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP files are allowed"));
    }
  },
});

export default upload;