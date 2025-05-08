import { Container, Form, Button, Card } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: Yup.string().oneOf(["student", "admin"], "Invalid role").required("Role is required"),
  });

  const handleRegister = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", values);
      const { message } = response.data;
      toast.success(message);
      navigate("/login");
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Register</h2>
        <Formik
          initialValues={{ name: "", email: "", password: "", role: "student" }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting }) => (
            <FormikForm>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Field type="text" name="name" className="form-control" as={Form.Control} />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Field type="email" name="email" className="form-control" as={Form.Control} />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Field type="password" name="password" className="form-control" as={Form.Control} />
                <ErrorMessage name="password" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Role</Form.Label>
                <Field as="select" name="role" className="form-control">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </Field>
                <ErrorMessage name="role" component="div" className="text-danger" />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default Register;
