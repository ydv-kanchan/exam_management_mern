import { useState, useEffect } from "react";
import { Container, Table, Button, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ExamResults = () => {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  if (!user) throw new Error("No token found");

  const parsedUser = JSON.parse(user);
  if (!parsedUser.token) throw new Error("No token found in user object");

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/exam-results/${examId}`,
        {
          headers: { Authorization: `Bearer ${parsedUser.token}` },
        }
      );
      setResults(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <h2 className="text-primary mb-4">📊 Exam Results</h2>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          ⬅️ Back
        </Button>

        {results.length === 0 ? (
          <p>No students have taken this exam yet.</p>
        ) : (
          <Table striped bordered hover responsive className="text-center">
            <thead className="bg-primary text-white">
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Score</th>
                <th>Status</th>
                <th>Exam Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.studentId}>
                  <td>{index + 1}</td>
                  <td>{result.name}</td>
                  <td>{result.email}</td>
                  <td>{result.score}</td>
                  <td>{result.passed}</td>
                  <td>{result.examDate}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
};

export default ExamResults;
