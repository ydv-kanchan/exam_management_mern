import { useState, useEffect } from "react";
import { Container, Table, Card, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentExamList = () => {
  const [examResults, setExamResults] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.student?._id;
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) fetchStudentExams();
  }, [studentId]);

  const fetchStudentExams = async () => {
    try {
      console.log("Token in frontend:", user?.token);
      const response = await axios.get(
        `http://localhost:5000/api/student/${studentId}/exams`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setExamResults(response.data.exams);
    } catch (error) {
      toast.error("Failed to fetch exams.");
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <Row>
          <Col sm={8}>
            <h2 className="text-primary mb-4">📜 My Exam Results</h2>
          </Col>
          {/* <Col sm={4} className="text-end">
                        <Button variant="secondary" onClick={() => navigate(-1)}>⬅️ Back</Button>
                    </Col> */}
        </Row>

        <Table striped bordered hover responsive className="text-center">
          <thead className="bg-primary text-white">
            <tr>
              <th>#</th>
              <th>Exam Title</th>
              <th>Date</th>
              <th>Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {examResults.length > 0 ? (
              examResults.map((exam, index) => (
                <tr key={exam._id}>
                  <td>{index + 1}</td>
                  <td>{exam?.title || "Unknown Exam"}</td>
                  <td>{new Date(exam.examDate).toLocaleString()}</td>
                  <td>{exam.score}</td>
                  <td className={exam.passed ? "text-success" : "text-danger"}>
                    {exam.passed ? "✅ Passed" : "❌ Failed"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No exams taken yet.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default StudentExamList;
