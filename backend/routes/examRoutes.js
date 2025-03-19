const express = require("express");
const Exam = require("../models/Exam");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const Result = require("../models/Result");

const router = express.Router();

// Create Exam
router.post(
  "/create",
  authenticateUser,
  authorizeAdmin,
  // createExamValidation,
  async (req, res) => {
    if (req.student.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const exam = new Exam(req.body);
    await exam.save();
    res.json({
      message: "Exam created successfully",
      exam: {
        title: exam.title,
        questions: exam.questions,
        _id: exam._id,
        createdAt: exam.createdAt,
      },
    });
  }
);

// Get All Exams
router.get("/", authenticateUser, async (req, res) => {
  const exams = await Exam.find().select("_id createdAt questions title");
  res.json(exams);
});

// Get Single Exam
router.get("/:id", authenticateUser, async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  res.json(exam);
});


module.exports = router;
