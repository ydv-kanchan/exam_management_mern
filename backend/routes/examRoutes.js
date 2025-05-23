const express = require("express");
const Exam = require("../models/Exam");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

const shuffleArray = (array) => {
  // Fisher-Yates Shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Create Exam
router.post(
  "/create",
  authenticateUser,
  authorizeAdmin,
  async (req, res) => {
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
  }
);

// Get All Exams
router.get("/", authenticateUser, async (req, res) => {
  const exams = await Exam.find().select("_id createdAt questions title duration");
  res.json(exams);
});

// Get Single Exam
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Randomly select numQuestionsToAsk questions
    const totalQuestions = exam.questions.length;
    const count = exam.numQuestionsToAsk;

    // Shuffle the questions array and pick first 'count'
    const shuffled = exam.questions
      .map(q => ({ ...q.toObject(), _id: q._id })) // convert to plain object
      .sort(() => 0.5 - Math.random());

    const selectedQuestions = shuffled.slice(0, count);

    // Return exam info with selected random questions
    res.json({
      _id: exam._id,
      title: exam.title,
      duration: exam.duration,
      numQuestionsToAsk: exam.numQuestionsToAsk,
      questions: selectedQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
