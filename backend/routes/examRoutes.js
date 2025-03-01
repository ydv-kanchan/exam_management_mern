const express = require('express');
const Exam = require('../models/Exam');
const { authenticateStudent, authorizeAdmin } = require('../middleware/authMiddleware');
const { createExamValidation, formateValidationMessage } = require('../validation/validations');
const Result = require('../models/Result');

const router = express.Router();

// Create Exam
router.post('/create', authenticateStudent, authorizeAdmin, createExamValidation, async (req, res) => {
    formateValidationMessage(req,res)
    if (req.student.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const exam = new Exam(req.body);
    await exam.save();
    res.json({ message: 'Exam created successfully', exam: {title: exam.title, questions: exam.questions, _id:exam._id, createdAt:exam.createdAt} });
});

// Get All Exams
router.get('/', authenticateStudent,authorizeAdmin, async (req, res) => {
    const exams = await Exam.find().select('_id createdAt questions title');
    res.json(exams);
});

// Get Single Exam
router.get('/:id', authenticateStudent,authorizeAdmin, async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    res.json(exam);
});

module.exports = router;
