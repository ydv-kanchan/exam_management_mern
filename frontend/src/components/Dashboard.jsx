import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Container, Card, ListGroup } from "react-bootstrap";

function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (user) {
            setRole(user.student.role);
        } else {
            navigate("/login");
        }
    }, [user, navigate]);

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="shadow-lg p-4" style={{ width: "450px", borderRadius: "10px" }}>
                <Card.Body>
                    <h2 className="text-center text-primary mb-4">Welcome</h2>
                    {role === "admin" && (
                        <>
                            <h4 className="text-center text-success mb-3">Admin {user?.student?.name}</h4>
                            <ListGroup variant="flush">
                                <ListGroup.Item action as={Link} to="/students">
                                    📌 Manage Students (List, Update, Delete)
                                </ListGroup.Item>
                                <ListGroup.Item action as={Link} to="/exams">
                                    📝 Create & List Exams
                                </ListGroup.Item>
                            </ListGroup>
                        </>
                    )}
                    {role === "student" && (
                        <>
                            <h4 className="text-center text-info mb-3">Student {user?.student?.name}</h4>
                            <ListGroup variant="flush">
                                <ListGroup.Item action as={Link} to="/exams">
                                    📝 Take Exam
                                </ListGroup.Item>
                                <ListGroup.Item action as={Link} to="/exam-list">
                                    📜 All Taken Exams
                                </ListGroup.Item>
                            </ListGroup>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Dashboard;
