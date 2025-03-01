const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);
