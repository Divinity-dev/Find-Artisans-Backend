import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import userRoutes from "./routes/userRoute.js";
import jobRoutes from "./routes/jobRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import authRoutes from "./routes/authRoute.js";
import portfolioRoutes from "./routes/portflioRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminAnalyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);

mongoose.connect(process.env.Mongo_url, {
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB", err));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});