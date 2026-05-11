import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Received credentials:", email, password);
  console.log("Expected credentials:", process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

  // Compare against .env values
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Issue JWT with role: admin
    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token valid for 7 days
    );

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
    });
  }

  // Invalid credentials
  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

export default router;
