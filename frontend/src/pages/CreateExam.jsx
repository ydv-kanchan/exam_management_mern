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
        questions: Yup.array()
            .of(
                Yup.object().shape({
                    question: Yup.string().required("Question is required"),
                    options: Yup.array()
                        .of(Yup.string().required("Option is required"))
                        .min(2, "At least two options required"),
                    correctAnswer: Yup.string().required("Correct answer is required").test(
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
        questions: [{ question: "", options: ["", ""], correctAnswer: "" }],
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/exams/create",
                values,
                { headers: { Authorization: `Bearer ${parsedUser.token}` } }
            );
            toast.success(response.data.message);
            navigate("/dashboard/exams");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create exam");
        }
        setSubmitting(false);
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <h2 className="text-primary text-center mb-4">➕ Create New Exam</h2>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ values, setFieldValue, isSubmitting }) => (
                        <FormikForm>
                            <Form.Group className="mb-3">
                                <Form.Label>Exam Title</Form.Label>
                                <Field name="title" as={Form.Control} placeholder="Enter exam title" />
                                <ErrorMessage name="title" component="div" className="text-danger" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Exam Duration (in minutes)</Form.Label>
                                <Field name="duration" as={Form.Control} placeholder="Enter duration" />
                                <ErrorMessage name="duration" component="div" className="text-danger" />
                            </Form.Group>

                            <FieldArray name="questions">
                                {({ push, remove }) => (
                                    <>
                                        {values.questions.map((q, qIndex) => (
                                            <Card key={qIndex} className="mb-4 p-3">
                                                <Row>
                                                    <Col>
                                                        <Form.Group>
                                                            <Form.Label>Question {qIndex + 1}</Form.Label>
                                                            <Field
                                                                name={`questions.${qIndex}.question`}
                                                                as={Form.Control}
                                                                placeholder="Enter question"
                                                            />
                                                            <ErrorMessage name={`questions.${qIndex}.question`} component="div" className="text-danger" />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <FieldArray name={`questions.${qIndex}.options`}>
                                                    {({ push: pushOption, remove: removeOption }) => (
                                                        <>
                                                            {values.questions[qIndex].options.map((opt, optIndex) => (
                                                                <Row key={optIndex} className="align-items-center mt-2">
                                                                    <Col>
                                                                        <Field
                                                                            name={`questions.${qIndex}.options.${optIndex}`}
                                                                            as={Form.Control}
                                                                            placeholder={`Option ${optIndex + 1}`}
                                                                        />
                                                                        <ErrorMessage name={`questions.${qIndex}.options.${optIndex}`} component="div" className="text-danger" />
                                                                    </Col>
                                                                    {values.questions[qIndex].options.length > 2 && (
                                                                        <Col xs="auto">
                                                                            <Button variant="danger" onClick={() => removeOption(optIndex)} size="sm">
                                                                                🗑
                                                                            </Button>
                                                                        </Col>
                                                                    )}
                                                                </Row>
                                                            ))}
                                                            <Row>
                                                                <Col className="text-start">
                                                                    <Button variant="success" size="sm" className="mt-2" onClick={() => pushOption("")}>
                                                                        ➕ Add Option
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    )}
                                                </FieldArray>
                                                <Form.Group className="mt-3">
                                                    <Form.Label>Correct Answer</Form.Label>
                                                    <Field
                                                        name={`questions.${qIndex}.correctAnswer`}
                                                        as={Form.Control}
                                                        placeholder="Enter correct answer"
                                                    />
                                                    <ErrorMessage name={`questions.${qIndex}.correctAnswer`} component="div" className="text-danger" />
                                                </Form.Group>
                                                <Row>
                                                    <Col className="text-start">
                                                        <Button variant="danger" className="mt-3" onClick={() => remove(qIndex)} disabled={values.questions.length === 1}>❌ Remove Question</Button>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                        <Button variant="primary" onClick={() => push({ question: "", options: ["", ""], correctAnswer: "" })}>
                                            ➕ Add Question
                                        </Button>
                                    </>
                                )}
                            </FieldArray>
                            <div className="text-center mt-4">
                                <Button type="submit" variant="success">{isSubmitting ? "Submitting..." : "✅ Create Exam"}</Button>
                                <Button variant="secondary" className="ms-3" onClick={() => navigate("/dashboard/exams")}>⬅️ Cancel</Button>
                            </div>
                        </FormikForm>
                    )}
                </Formik>
            </Card>
        </Container>
    );
};

export default CreateExam;
