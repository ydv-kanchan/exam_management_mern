const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const {
  registerValidation,
  loginValidation,
} = require("../validation/validations");

const router = express.Router();

// Register Student (Admin or Student)
router.post("/register", registerValidation, async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    role = role || "student";

    if (!["admin", "student"].includes(role)) {
      return res
        .status(400)
        .json({ error: 'Invalid role. Choose "admin" or "student".' });
    }

    if (role === "admin") {
      const adminExists = await Student.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(400).json({ error: "Admin already exists." });
      }
    }

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await student.save();

    res.json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } registered successfully, Please login your account`,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Login
router.post("/login", loginValidation, async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email }).select('-__v -updatedAt');
  if (!student) return res.status(400).json({ error: "Student not found" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: student._id, role: student.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, student });
});

module.exports = router;
