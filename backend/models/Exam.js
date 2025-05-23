const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    numQuestionsToAsk: {
      type: Number,
      required: true,
      min: [1, "Must select at least one question"]
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", ExamSchema);
