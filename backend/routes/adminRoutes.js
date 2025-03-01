const express = require("express");
const Student = require("../models/Student");
const {
  formateValidationMessage,
  updateStudentValidation,
} = require("../validation/validations");
const {
  authorizeAdmin,
  authenticateStudent,
} = require("../middleware/authMiddleware");

const router = express.Router();

// get students
router.get(
  "/students",
  authenticateStudent,
  authorizeAdmin,
  async (req, res) => {
    try {
      const students = await Student.find(
        { role: "student" },
        "-password -role -updatedAt -__v"
      );
      res.json({ students });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// update student
router.put(
  "/student/:id",
  authenticateStudent,
  authorizeAdmin,
  updateStudentValidation,
  async (req, res) => {
    formateValidationMessage(req, res);

    try {
      // if id not exist in database then return error
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      res.json({ message: "Student updated successfully", updatedStudent });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong", description: error.message });
    }
  }
);

// delete student
router.delete(
  "/student/:id",
  authenticateStudent,
  authorizeAdmin,
  async (req, res) => {
    formateValidationMessage(req, res);
    try {
      // if id not exist in database then return error
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);
      res.json({ message: "Student deleted successfully", deletedStudent });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong", description: error.message });
    }
  }
);

module.exports = router;
