import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CreateExam = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  if (!user) throw new Error("No token found");

  const parsedUser = JSON.parse(user);
  if (!parsedUser.token) throw new Error("No token found in user object");

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Exam title is required"),
    duration: Yup.number()
      .required("Duration is required")
      .positive("Must be a positive number")
      .integer("Must be an integer"),
    numQuestionsToAsk: Yup.number()
      .required("Number of questions to ask is required")
      .min(1, "Must select at least one question")
      .integer("Must be an integer"),
    questions: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          options: Yup.array()
            .of(Yup.string().required("Option is required"))
            .min(2, "At least two options required"),
          correctAnswer: Yup.string()
            .required("Correct answer is required")
            .test(
              "valid-correct-answer",
              "Correct answer must be one of the provided options",
              function (value) {
                const { options } = this.parent;
                return options.includes(value);
              }
            ),
        })
      )
      .min(1, "At least one question is required"),
  });

  const initialValues = {
    title: "",
    duration: "",
    numQuestionsToAsk: "",
    questions: [{ question: "", options: ["", ""], correctAnswer: "" }],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post(
        "http://localhost:5000/api/exams/create",
        values,
        {
          headers: { Authorization: `Bearer ${parsedUser.token}` },
        }
      );
      toast.success("Exam created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create exam");
    }
    setSubmitting(false);
  };

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <h2 className="mb-4">Create New Exam</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <FormikForm>
              <Form.Group className="mb-3">
                <Form.Label>Exam Title</Form.Label>
                <Field
                  name="title"
                  className={`form-control ${
                    touched.title && errors.title ? "is-invalid" : ""
                  }`}
                />
                <ErrorMessage
                  component="div"
                  name="title"
                  className="invalid-feedback"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Duration (minutes)</Form.Label>
                    <Field
                      type="number"
                      name="duration"
                      className={`form-control ${
                        touched.duration && errors.duration ? "is-invalid" : ""
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      name="duration"
                      className="invalid-feedback"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Number of Questions to Ask</Form.Label>
                    <Field
                      type="number"
                      name="numQuestionsToAsk"
                      className={`form-control ${
                        touched.numQuestionsToAsk && errors.numQuestionsToAsk
                          ? "is-invalid"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      name="numQuestionsToAsk"
                      className="invalid-feedback"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <FieldArray name="questions">
                {({ push, remove }) => (
                  <>
                    {values.questions.map((question, index) => (
                      <Card key={index} className="mb-4 p-3">
                        <Form.Group className="mb-3">
                          <Form.Label>Question {index + 1}</Form.Label>
                          <Field
                            name={`questions[${index}].question`}
                            className={`form-control ${
                              touched.questions &&
                              touched.questions[index]?.question &&
                              errors.questions &&
                              errors.questions[index]?.question
                                ? "is-invalid"
                                : ""
                            }`}
                          />
                          <ErrorMessage
                            component="div"
                            name={`questions[${index}].question`}
                            className="invalid-feedback"
                          />
                        </Form.Group>

                        <FieldArray name={`questions[${index}].options`}>
                          {({ push: pushOption, remove: removeOption }) => (
                            <>
                              {question.options.map((option, optIndex) => (
                                <Form.Group
                                  className="mb-2 d-flex align-items-center"
                                  key={optIndex}
                                >
                                  <Field
                                    name={`questions[${index}].options[${optIndex}]`}
                                    className={`form-control me-2 ${
                                      touched.questions &&
                                      touched.questions[index]?.options &&
                                      touched.questions[index].options[optIndex] &&
                                      errors.questions &&
                                      errors.questions[index]?.options &&
                                      errors.questions[index].options[optIndex]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                  <Button
                                    variant="danger"
                                    onClick={() => removeOption(optIndex)}
                                    disabled={question.options.length <= 2}
                                  >
                                    Remove
                                  </Button>
                                  <ErrorMessage
                                    component="div"
                                    name={`questions[${index}].options[${optIndex}]`}
                                    className="invalid-feedback"
                                  />
                                </Form.Group>
                              ))}

                              <Button
                                variant="secondary"
                                onClick={() => pushOption("")}
                                className="mb-3"
                              >
                                Add Option
                              </Button>
                            </>
                          )}
                        </FieldArray>

                        <Form.Group>
                          <Form.Label>Correct Answer</Form.Label>
                          <Field
                            as="select"
                            name={`questions[${index}].correctAnswer`}
                            className={`form-select ${
                              touched.questions &&
                              touched.questions[index]?.correctAnswer &&
                              errors.questions &&
                              errors.questions[index]?.correctAnswer
                                ? "is-invalid"
                                : ""
                            }`}
                          >
                            <option value="">Select correct answer</option>
                            {question.options.map((opt, idx) => (
                              <option key={idx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            component="div"
                            name={`questions[${index}].correctAnswer`}
                            className="invalid-feedback"
                          />
                        </Form.Group>

                        <Button
                          variant="danger"
                          className="mt-3"
                          onClick={() => remove(index)}
                          disabled={values.questions.length <= 1}
                        >
                          Remove Question
                        </Button>
                      </Card>
                    ))}

                    <Button
                      variant="primary"
                      onClick={() => push({ question: "", options: ["", ""], correctAnswer: "" })}
                    >
                      Add Question
                    </Button>
                  </>
                )}
              </FieldArray>

              <Button
                type="submit"
                className="mt-4"
                variant="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Exam"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default CreateExam;
