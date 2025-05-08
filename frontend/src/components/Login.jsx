import { Container, Form, Button, Card } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import axios from "axios";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", values);
      const { token, student } = response.data;

      login({ student, token });

      toast.success(`${student.role} logged in successfully!`);
      navigate("/dashboard");
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || error.message || "Server not responding");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <FormikForm>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Field
                  type="email"
                  name="email"
                  className="form-control"
                  as={Form.Control}
                />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Field
                  type="password"
                  name="password"
                  className="form-control"
                  as={Form.Control}
                />
                <ErrorMessage name="password" component="div" className="text-danger" />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default Login;
