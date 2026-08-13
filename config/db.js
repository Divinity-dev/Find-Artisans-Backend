import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
  try {
    // Already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // Connection is currently being established
    if (isConnecting) {
      await new Promise((resolve, reject) => {
        const onConnected = () => {
          cleanup();
          resolve();
        };

        const onError = (error) => {
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          mongoose.connection.off("connected", onConnected);
          mongoose.connection.off("error", onError);
        };

        mongoose.connection.once("connected", onConnected);
        mongoose.connection.once("error", onError);
      });

      return;
    }

    isConnecting = true;

    await mongoose.connect(process.env.Mongo_url, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  } finally {
    isConnecting = false;
  }
};

export default connectDB;