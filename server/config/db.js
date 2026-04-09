import mongoose from "mongoose";

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  mongoose.set("sanitizeFilter", true);

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  console.log("Connected to MongoDB");
};

export default connectDatabase;
