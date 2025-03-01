const express = require('express');
const Exam = require('../models/Exam');
const { authenticateStudent, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create Exam
router.post('/', authenticateStudent,authorizeAdmin, async (req, res) => {
    if (req.student.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const exam = new Exam(req.body);
    await exam.save();
    res.json({ message: 'Exam created successfully' });
});

// Get All Exams
router.get('/', authenticateStudent,authorizeAdmin, async (req, res) => {
    const exams = await Exam.find();
    res.json(exams);
});

// Get Single Exam
router.get('/:id', authenticateStudent,authorizeAdmin, async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    res.json(exam);
});

module.exports = router;
