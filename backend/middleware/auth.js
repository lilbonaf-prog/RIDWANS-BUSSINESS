import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // remove "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user token:", decoded);

    // ✅ Only id is guaranteed in user tokens
    req.user = { id: decoded.id };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
