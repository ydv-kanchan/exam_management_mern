import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Card, Modal, Row, Col } from "react-bootstrap";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { ErrorMessage, Field, Formik } from "formik";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function StudentList() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [show, setShow] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const navigate = useNavigate()

    const user = localStorage.getItem("user");
    if (!user) throw new Error("No token found");

    const parsedUser = JSON.parse(user);
    if (!parsedUser.token) throw new Error("No token found in user object");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/admin/students", {
                headers: { Authorization: `Bearer ${parsedUser.token}` },
            });
            setStudents(response.data.students);
        } catch (error) {
            console.log({ error });
            toast.error(error?.response?.data?.error || "Failed to fetch students");
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://localhost:5000/api/admin/student/${id}`, {
                        headers: { Authorization: `Bearer ${parsedUser.token}` },
                    });

                    setStudents((prevStudents) => prevStudents.filter(student => student._id !== id));

                    Swal.fire("Deleted!", response.data.message, "success");
                } catch (error) {
                    Swal.fire("Error!", "Failed to delete student.", "error");
                }
            }
        });
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setShow(true);
    };

    const handleUpdate = async (values, { setSubmitting }) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/admin/student/${selectedStudent._id}`, values, {
                headers: { Authorization: `Bearer ${parsedUser.token}` },
            });
            toast.success(response.data.message);
            setStudents(students.map((s) => (s._id === selectedStudent._id ? { ...s, ...values } : s)));
            setShow(false);
        } catch (error) {
            toast.error(error?.response?.data?.error || "Error updating student!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <Row className="">
                    <Col sm={8}>
                        <h2 className="text-primary mb-4">📚 Student List</h2>
                    </Col>
                    <Col sm={4}>
                        <Button variant="secondary" onClick={() => navigate(-1)}>⬅️ Back</Button>
                    </Col>
                </Row>

                <Form className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Form>

                <Table striped bordered hover responsive className="text-center">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 && <tr><td colSpan={4}>No students found</td></tr>}
                        {students
                            .filter(student => student.name.toLowerCase().includes(search.toLowerCase()))
                            .map((student, index) => (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <Button onClick={() => handleEditClick(student)} variant="warning" className="me-2" size="sm">
                                            ✏️
                                        </Button>
                                        <Button variant="danger" onClick={() => handleDelete(student._id)} size="sm">
                                            ❌
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Card>

            {selectedStudent && (
                <Modal show={show} onHide={() => setShow(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Student</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{
                                name: selectedStudent.name,
                                email: selectedStudent.email
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
                                email: Yup.string().required("Email is required").email("Invalid email format")
                            })}
                            onSubmit={handleUpdate}
                        >
                            {({ handleSubmit, isSubmitting }) => (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Field type="text" name="name" as={Form.Control} />
                                        <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Field type="email" name="email" as={Form.Control} />
                                        <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                                    </Form.Group>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Updating..." : "Update"}
                                        </Button>
                                    </Modal.Footer>
                                </Form>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
}

export default StudentList;
