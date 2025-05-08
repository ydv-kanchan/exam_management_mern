import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  if (!user) throw new Error("No token found");

  const parsedUser = JSON.parse(user);
  if (!parsedUser.token) throw new Error("No token found in user object");

  const userRole = parsedUser.student.role;

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/exams", {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      });
      setExams(response.data);
    } catch (error) {
      toast.error(error || "Failed to fetch students");
    }
  };

  return (
    <>
      <Container className="mt-5">
        <Card className="shadow-lg p-4">
          <Row className="">
            <Col sm={8}>
              <h2 className="text-primary mb-4">📝 Exam List</h2>
            </Col>
            <Col sm={4} className="text-end">
              {userRole === "admin" && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/dashboard/exams/create")}
                  className="me-3"
                >
                  ➕ Create Exam
                </Button>
              )}
              
            </Col>
          </Row>

          <Form className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>

          <Table striped bordered hover responsive className="text-center">
            <thead className="bg-primary text-white">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams
                .filter((exam) =>
                  exam.title.toLowerCase().includes(search.toLowerCase())
                )
                .map((exam, index) => (
                  <tr key={exam._id}>
                    <td>{index + 1}</td>
                    <td>{exam.title}</td>
                    <td>{new Date(exam.createdAt).toLocaleString()}</td>
                    <td>
                      {userRole === "admin" ? (
                        <>
                          <Button
                            as={Link}
                            to={`/dashboard/exams/view/${exam._id}`}
                            variant="info"
                            className="me-2"
                            size="sm"
                          >
                            👁 View
                          </Button>
                          <Button
                            as={Link}
                            to={`/dashboard/exams/results/${exam._id}`}
                            variant="warning"
                            className="me-2"
                            size="sm"
                          >
                            📊 View Results
                          </Button>
                        </>
                      ) : (
                        <Button
                          as={Link}
                          to={`/dashboard/exams/take/${exam._id}`}
                          variant="success"
                          className="me-2"
                          size="sm"
                        >
                          🎯 Take Exam
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
};

export default ExamList;
