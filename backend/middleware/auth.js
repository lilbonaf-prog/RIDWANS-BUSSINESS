import jwt from "jsonwebtoken";

// ==========================================
// RIDWAN BUSINESS
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================

const authMiddleware = (req, res, next) => {
  try {
    // ======================================
    // GET AUTHORIZATION HEADER
    // ======================================

    const authorizationHeader =
      req.headers.authorization || "";

    // Temporary compatibility with existing
    // frontend requests using headers: { token }

    const legacyTokenHeader = req.headers.token;

    // ======================================
    // EXTRACT JWT TOKEN
    // ======================================

    let token = null;

    // Preferred format:
    // Authorization: Bearer YOUR_TOKEN

    const bearerMatch = authorizationHeader.match(
      /^Bearer\s+(.+)$/i
    );

    if (bearerMatch) {
      token = bearerMatch[1].trim();
    }

    // Support existing frontend until its
    // authentication headers are updated.

    if (!token && typeof legacyTokenHeader === "string") {
      token = legacyTokenHeader.trim();
    }

    // ======================================
    // CHECK TOKEN
    // ======================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in.",
      });
    }

    // ======================================
    // CHECK JWT CONFIGURATION
    // ======================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication service unavailable.",
      });
    }

    // ======================================
    // VERIFY TOKEN SIGNATURE
    // ======================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ======================================
    // VALIDATE USER INFORMATION
    // ======================================

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ======================================
    // ATTACH AUTHENTICATED USER
    // ======================================

    req.user = {
      id: decoded.id,
    };

    // ======================================
    // CONTINUE TO PROTECTED ROUTE
    // ======================================

    next();

  } catch (error) {

    // ======================================
    // EXPIRED TOKEN
    // ======================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    // ======================================
    // INVALID TOKEN
    // ======================================

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

export default authMiddleware;