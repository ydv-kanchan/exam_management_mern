
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";

function ExamDetails() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamDetail();
  }, []);

  const fetchExamDetail = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) throw new Error("User not found in local storage");

      const parsedUser = JSON.parse(user);
      if (!parsedUser.token) throw new Error("Token not found");

      const response = await axios.get(
        `http://localhost:5000/api/exams/${id}`,
        {
          headers: { Authorization: `Bearer ${parsedUser.token}` },
        }
      );

      setExam(response.data);
      console.log(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch exam details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <Row className="">
          <Col sm={10}>
            <h2 className="text-primary">📝 {exam.title}</h2>
            {/* Styled Duration */}
            <h4 className="mt-2" style={{ color: "#6c757d" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>⏰ Duration:</span>{" "}
              <span
                style={{
                  color: "#28a745", // Green for a positive/active feel
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {exam.duration} minutes
              </span>
            </h4>
          </Col>
          <Col sm={2}>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ⬅
            </Button>
          </Col>
        </Row>
        <h4 className="mt-4">Questions:</h4>
        <ListGroup className="mt-2">
          {exam.questions.map((q, index) => (
            <ListGroup.Item key={q._id}>
              <strong>Q{index + 1}:</strong> {q.question}
              <ul className="mt-2">
                {q.options.map((option, i) => (
                  <li key={i}>{option}</li>
                ))}
              </ul>
              <strong>✅ Correct Answer:</strong> {q.correctAnswer}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </Container>
  );
}

export default ExamDetails;
