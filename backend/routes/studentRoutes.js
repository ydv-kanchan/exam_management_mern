const express = require('express');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Exams (Student)
router.get('/exams', authMiddleware, async (req, res) => {
    const exams = await Exam.find();
    res.json(exams);
});

// Take Exam
router.post('/exams/:examId/submit', authMiddleware, async (req, res) => {
    if (req.student.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const { answers } = req.body;
    let score = 0;

    exam.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) score++;
    });

    const passingScore = exam.questions.length / 2;
    const passed = score >= passingScore;

    const result = new Result({
        studentId: req.student.id,
        examId: req.params.examId,
        score,
        passed
    });

    await result.save();
    res.json({ score, passed });
});

// Get Student Exam Results
router.get('/results', authMiddleware, async (req, res) => {
    const results = await Result.find({ studentId: req.student.id }).populate('examId');
    res.json(results);
});

module.exports = router;
