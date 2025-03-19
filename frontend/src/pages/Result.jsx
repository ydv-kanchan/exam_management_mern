import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Button, Table, ProgressBar } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const Result = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const studentId = searchParams.get("studentId");
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        fetchResult();
    }, []);
    const fetchResult = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/student/results/${id}?studentId=${studentId}`, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}` },
            });

            setResultData(response.data);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch result");
        }
    };

    if (!resultData) return <p className="text-center mt-5">Loading result...</p>;
    const { message, examResult } = resultData;

    const { student, exam, answers, performance, examDate } = examResult;

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <h2 className="text-primary text-center mb-4">{exam.title} - {exam.status}</h2>
                <h5 className="text-center text-secondary">{message}</h5>

                <Card className="p-3 bg-light">
                    <h5>Student Info</h5>
                    <p className="mb-1"><strong>Name:</strong> {student.name}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                </Card>

                <Card className="mt-3 p-3 bg-light">
                    <h5>Performance</h5>
                    <p>Total Questions: {performance.totalQuestions}</p>
                    <p>Correct Answers: ✅ {performance.correctAnswers}</p>
                    <p>Incorrect Answers: ❌ {performance.incorrectAnswers}</p>
                    <ProgressBar
                        now={parseInt(performance.accuracy)}
                        label={`${performance.accuracy}`}
                        variant={performance.passed ? "success" : "danger"}
                    />
                </Card>

                <h5 className="mt-4">Question Breakdown</h5>
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answers.map((ans, index) => {
                            const isCorrect = ans.selectedOption === ans.correctAnswer;
                            return (
                                <tr key={ans.questionId}>
                                    <td>{index + 1}</td>
                                    <td>{ans.question}</td>
                                    <td>{ans.selectedOption}</td>
                                    <td>{ans.correctAnswer}</td>
                                    <td className={isCorrect ? "text-success" : "text-danger"}>
                                        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                <p className="text-muted text-center mt-3">Exam Date: {examDate}</p>
                <Button variant="secondary" className="mt-3" onClick={() => navigate("/")}>🏠 Home</Button>
            </Card>
        </Container>
    );
};

export default Result;
