import mongoose from "mongoose";

export const connectDB = async (customUri) => {
  const mongoUri = customUri || process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg =
      "[DB] CRITICAL ERROR: MONGO_URI is not defined. Cannot connect to MongoDB. " +
      "Please set MONGO_URI in your environment or .env file.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(
      `[DB] Connected to MongoDB successfully at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
    );
    return conn.connection;
  } catch (error) {
    const errorMsg =
      `[DB] CRITICAL ERROR: Failed to connect to MongoDB at "${mongoUri}". ` +
      `Ensure MongoDB is running and reachable. Details: ${error.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("[DB] Disconnected from MongoDB.");
  }
};

export default connectDB;
