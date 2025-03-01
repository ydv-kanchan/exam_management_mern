const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authenticateStudent = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded; // Attach student details to request
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid token.", description: error.message });
  }
};

// Middleware to allow only admins
const authorizeAdmin = (req, res, next) => {
  if (req.student.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// Middleware to allow only students
const authorizeStudent = (req, res, next) => {
  if (req.student.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }
  next();
};

module.exports = { authenticateStudent, authorizeAdmin, authorizeStudent };
