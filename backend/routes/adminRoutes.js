const express = require("express");
const Student = require("../models/Student");
const {
  authorizeAdmin,
  authenticateUser,
} = require("../middleware/authMiddleware");
const { updateStudentValidation } = require("../validation/validations");
const Result = require("../models/Result");

const router = express.Router();

// get students
router.get(
  "/students",
  authenticateUser,
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
  authenticateUser,
  authorizeAdmin,
  updateStudentValidation,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      res.json({ message: "Student update successfully", updatedStudent });
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
  authenticateUser,
  authorizeAdmin,
  async (req, res) => {
    try {
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

router.get("/exam-results/:examId", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ examId })
      .populate("studentId", "name email")
      .populate("examId", "title")
      .select("studentId score passed createdAt");

    if (!results.length) {
      return res.status(404).json({ message: "No students have taken this exam yet." });
    }

    const studentResults = results.map((result) => ({
      studentId: result.studentId._id,
      name: result.studentId.name,
      email: result.studentId.email,
      examTitle: result.examId.title,
      score: `${result.score}%`,
      passed: result.passed ? "✅ Passed" : "❌ Failed",
      examDate: new Date(result.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));

    res.json(studentResults);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
