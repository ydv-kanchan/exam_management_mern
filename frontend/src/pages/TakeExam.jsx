import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Form, Row, Col, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.student?._id;

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const intervalRef = useRef(null);

  const fetchExam = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setExam(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch exam");
    }
  }, [id, user?.token]);

  const handleSubmit = useCallback(async () => {
    clearInterval(intervalRef.current);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const payload = {
        studentId,
        answers: formattedAnswers,
      };

      await axios.post(`http://localhost:5000/api/student/exams/${id}/submit`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      toast.success("Exam submitted successfully!");
      setModalShow(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit exam");
    }
  }, [answers, id, studentId, user?.token]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchExam();
  }, [user, navigate, fetchExam]);

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [examStarted, timeLeft]);

  useEffect(() => {
    if (examStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [examStarted, timeLeft, handleSubmit]);

  useEffect(() => {
    if (!examStarted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You cannot leave during the exam!";
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        toast.warn("You cannot switch tabs during the exam.");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examStarted]);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const startExam = () => {
    if (exam?.duration) {
      setQuestions(exam.questions);
      setTimeLeft(exam.duration * 60);
      setExamStarted(true);
      enterFullScreen();
    }
  };

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNavigateDashboard = () => {
    exitFullScreen();
    setModalShow(false);
    navigate("/dashboard");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!exam) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <Row>
          <Col sm={8}>
            <h2 className="text-primary mb-3">{exam.title}</h2>
          </Col>
          <Col sm={4} className="text-end">
            {!examStarted && (
              <Button variant="secondary" onClick={handleNavigateDashboard}>
                ⬅️ Back to Dashboard
              </Button>
            )}
          </Col>
        </Row>

        {!examStarted ? (
          <div className="text-center">
            <h4>Duration: {exam.duration} minutes</h4>
            <Button variant="primary" onClick={startExam}>
              Start Exam
            </Button>
          </div>
        ) : (
          <>
            <h5 className="mb-4 text-danger">Time Left: ⏳ {formatTime(timeLeft)}</h5>
            {questions.map((question, index) => (
              <Form.Group key={question._id} className="mb-4">
                <Form.Label>
                  {index + 1}. {question.question}
                </Form.Label>
                {question.options.map((option, i) => (
                  <Form.Check
                    key={i}
                    type="radio"
                    name={`question-${question._id}`}
                    label={option}
                    onChange={() => handleChange(question._id, option)}
                    checked={answers[question._id] === option}
                  />
                ))}
              </Form.Group>
            ))}

            <Button variant="success" className="mt-3" onClick={handleSubmit}>
              Submit Exam
            </Button>
          </>
        )}
      </Card>

      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Exam Submitted</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your exam has been successfully submitted. You can now go to the dashboard.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNavigateDashboard}>
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TakeExam;
