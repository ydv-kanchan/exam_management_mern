import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const studentId = user.student._id;
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchExam();
    }, []);

    const fetchExam = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/exams/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setExam(response.data);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch exam");
        }
    };

    const handleChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }));

            const payload = {
                studentId: studentId,
                answers: formattedAnswers
            };
            console.log({ payload });
            await axios.post(
                `http://localhost:5000/api/student/exams/${id}/submit`,
                payload,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            toast.success("Exam submitted successfully!");
            navigate(`/result/${id}?studentId=${studentId}`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to submit exam");
        }
    };

    if (!exam) return <p className="text-center mt-5">Loading...</p>;

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <Row className="">
                    <Col sm={8}>
                        <h2 className="text-primary mb-4">{exam.title}</h2>
                    </Col>
                    <Col sm={4} className="text-end">
                        <Button variant="secondary" onClick={() => navigate(-1)}>⬅️ Back</Button>
                    </Col>
                </Row>
                {exam.questions.map((question, index) => (
                    <>
                        {console.log({ question })}
                        <Form.Group key={question._id} className="mb-3">
                            <Form.Label>{index + 1}. {question.question}</Form.Label>
                            {question.options.map((option, i) => (
                                <>
                                    {console.log({ option })}
                                    <Form.Check
                                        key={i}
                                        type="radio"
                                        name={`question-${question._id}`}
                                        label={option}
                                        onChange={() => handleChange(question._id, option)}
                                    />
                                </>
                            ))}
                        </Form.Group>
                    </>
                ))}
                <Button variant="success" className="mt-3" onClick={handleSubmit}>Submit Exam</Button>
            </Card>
        </Container>
    );
};

export default TakeExam;
