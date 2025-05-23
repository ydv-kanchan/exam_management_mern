const express = require("express");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Student = require("../models/Student");

const router = express.Router();

// Take Exam
router.post("/exams/:examId/submit", async (req, res) => {
  const { studentId, answers } = req.body;
  const { examId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let correctAnswers = 0;

    answers.forEach((answer) => {
      const question = exam.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question && question.correctAnswer == answer.selectedOption) {
        correctAnswers++;
      }
    });

    const totalQuestions = exam.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 50;

    const result = await Result.create({
      studentId,
      examId,
      examDetails: { title: exam.title, description: exam.description },
      answers,
      score,
      passed,
    });

    res.json({
      message: "Exam submitted successfully",
      resultId: result._id,
      score,
      passed,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Get Student Exam Result by Exam ID
router.get("/results/:examId", async (req, res) => {
  const { examId } = req.params;
  const { studentId } = req.query;

  try {
    const result = await Result.findOne({ examId, studentId })
      .populate("studentId", "name email")
      .populate("examId", "title questions")
      .select("_id studentId examId answers score passed createdAt");

    if (!result) return res.status(404).json({ message: "Result not found" });

    const answerDetails = result.answers.map((answer) => {
      const questionData = result.examId.questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      const correctAnswer = questionData ? questionData.correctAnswer : null;
      const isCorrect = answer.selectedOption === correctAnswer;
      return {
        questionId: answer.questionId,
        question: questionData ? questionData.question : "Unknown Question",
        selectedOption: answer.selectedOption,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
      };
    });

    const correctAnswers = answerDetails.filter((a) => a.isCorrect).length;
    const totalQuestions = result.answers.length;
    const scorePercentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);
    const passed = result.passed;
    const statusText = passed ? "Passed ✅" : "Failed ❌";

    const passedMessage = passed
      ? `🎉 Congratulations! You have passed the '${result.examId.title}' with a score of ${scorePercentage}% (${correctAnswers} out of ${totalQuestions} correct).`
      : `⚠️ Unfortunately, you have failed the '${result.examId.title}' with a score of ${scorePercentage}% (${correctAnswers} out of ${totalQuestions} correct). Keep practicing!`;

    res.json({
      message: passedMessage,
      examResult: {
        resultId: result._id,
        student: {
          id: result.studentId._id,
          name: result.studentId.name,
          email: result.studentId.email,
        },
        exam: {
          id: result.examId._id,
          title: result.examId.title,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          score: `${scorePercentage}%`,
          status: statusText,
        },
        answers: answerDetails,
        performance: {
          totalQuestions,
          correctAnswers,
          incorrectAnswers: totalQuestions - correctAnswers,
          accuracy: `${scorePercentage}%`,
          passed,
        },
        examDate: new Date(result.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        generatedAt: result.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Get Student's All Exams
router.get("/:studentId/exams", async (req, res) => {
  console.log("Inside the route");
  const { studentId } = req.params;
  console.log(studentId);

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(student);

    const exams = await Result.find({ studentId })
      .populate("examId", "title")
      .select("_id studentId examId score passed createdAt")
      .sort({ createdAt: -1 });

    // Log any results with missing examId references
    exams.forEach(exam => {
      if (!exam.examId) {
        console.warn(`Warning: Missing exam document for Result ID ${exam._id}`);
      }
    });

    // Filter out results with missing exam references before sending response
    const filteredExams = exams
      .filter(exam => exam.examId !== null)
      .map(exam => ({
        examId: exam.examId._id,
        title: exam.examId.title,
        score: exam.score,
        examDate: exam.createdAt,
        passed: exam.passed,
      }));

    res.json({
      message: "Student exams fetched successfully",
      exams: filteredExams,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
