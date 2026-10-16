import mongoose from "mongoose";

// ==========================================
// RIDWAN BUSINESS
// MONGODB DATABASE CONNECTION
// ==========================================

export const connectDB = async () => {
  try {
    // ======================================
    // GET DATABASE CONFIGURATION
    // ======================================

    const mongoURI = process.env.MONGODB_URI;

    const databaseName = (
      process.env.MONGODB_DB_NAME || ""
    ).trim();

    // ======================================
    // VALIDATE CONNECTION STRING
    // ======================================

    if (!mongoURI) {
      console.error(
        "Database connection failed: MONGODB_URI is missing."
      );

      process.exit(1);
    }

    // ======================================
    // CONFIGURE DATABASE
    // ======================================

    // When MONGODB_DB_NAME is provided,
    // use that specific database.
    //
    // For local testing:
    // ridwan-business-test
    //
    // When MONGODB_DB_NAME is not provided,
    // Mongoose uses the database specified
    // in the MongoDB connection string.

    const connectionOptions = {};

    if (databaseName) {
      connectionOptions.dbName = databaseName;
    }

    // ======================================
    // CONNECT TO MONGODB
    // ======================================

    await mongoose.connect(
      mongoURI,
      connectionOptions
    );

    // ======================================
    // CONFIRM CONNECTION
    // ======================================

    console.log("DB Connected Successfully");

    console.log(
      "Connected Database:",
      mongoose.connection.name
    );

  } catch (error) {
    // ======================================
    // CONNECTION ERROR
    // ======================================

    console.error(
      "DB Connection Error:",
      error.message
    );

    process.exit(1);
  }
};