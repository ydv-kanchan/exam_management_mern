const { check } = require("express-validator");
const { validationResult } = require("express-validator");

// formate validation message common function
const formateValidationMessage = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = Object.fromEntries(
      Object.entries(errors.mapped()).map(([key, value]) => [key, value.msg])
    );
    return res.status(400).json({ errors: formattedErrors });
  }
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
};

// register admin or student
const registerValidation = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage(
      "Password must contain at least one special character (@$!%*?&)"
    ),
];

// login admin or student
const loginValidation = [
  check("email").isEmail().withMessage("Invalid email format"),
  check("password").notEmpty().withMessage("Password is required"),
];

// update student validation
const updateStudentValidation = [
  check("name").optional().notEmpty().withMessage("Name is required"),
  check("email").optional().isEmail().withMessage("Invalid email format"),
];

// create exam validation
const createExamValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),
  check("questions.*.question")
    .notEmpty()
    .withMessage("Question text is required"),
  check("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each question must have at least two options"),
  check("questions.*.correctAnswer")
    .notEmpty()
    .withMessage("Correct answer is required"),
];

module.exports = {
  formateValidationMessage,
  registerValidation,
  loginValidation,
  updateStudentValidation,
  createExamValidation,
};
