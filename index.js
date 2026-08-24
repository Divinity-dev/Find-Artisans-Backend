import "./env.js";
import express from "express";
import cors from "cors";

import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import userRoutes from "./routes/userRoute.js";
import jobRoutes from "./routes/jobRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import authRoutes from "./routes/authRoute.js";
import portfolioRoutes from "./routes/portflioRoutes.js";
import reviewRoutes from "./routes/reviewroute.js";

import connectDB from "./config/db.js";

const app = express();

// ======================
// CORS
// ======================

const corsOptions = {
  origin: true,
  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],

  exposedHeaders: [
    "Set-Cookie",
    "Authorization",
  ],

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// ======================
// DATABASE CONNECTION
// ======================





// ======================
// HEALTH CHECK
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FindArtisans API is running",
  });
});

// ======================
// ROUTES
// ======================

app.use("/api/admin", adminAnalyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/reviews", reviewRoutes);

// ======================
// LOCAL SERVER
// ======================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;