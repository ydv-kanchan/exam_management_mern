const express = require("express");
const Exam = require("../models/Exam");
const Result = require("../models/Result"); // Import the result model
const { authenticateUser, authorizeAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Fisher-Yates Shuffle
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// ✅ Create Exam (Admin Only)
router.post("/create", authenticateUser, authorizeAdmin, async (req, res) => {
  if (req.student.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  const exam = new Exam(req.body);
  await exam.save();

  res.json({
    message: "Exam created successfully",
    exam: {
      title: exam.title,
      duration: exam.duration,
      questions: exam.questions,
      numQuestionsToAsk: exam.numQuestionsToAsk,
      _id: exam._id,
      createdAt: exam.createdAt,
    },
  });
});

// ✅ Get All Exams
router.get("/", authenticateUser, async (req, res) => {
  const exams = await Exam.find().select("_id createdAt questions title duration");
  res.json(exams);
});

// ✅ Get Single Exam (Blocked if already attempted)
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const studentId = req.student._id;
    const examId = req.params.id;

    // Check if student already attempted
    const alreadyTaken = await Result.findOne({ studentId, examId });
    if (alreadyTaken) {
      return res.status(403).json({ message: "You have already completed this exam." });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const shuffled = shuffleArray(exam.questions.map(q => ({ ...q.toObject(), _id: q._id })));
    const selectedQuestions = shuffled.slice(0, exam.numQuestionsToAsk);

    res.json({
      _id: exam._id,
      title: exam.title,
      duration: exam.duration,
      numQuestionsToAsk: exam.numQuestionsToAsk,
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
