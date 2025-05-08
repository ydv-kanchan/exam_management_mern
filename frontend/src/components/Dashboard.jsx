import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { ListGroup } from "react-bootstrap";

function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user) {
      const userRole = user.student.role;
      setRole(userRole);

      // Redirect to default sub-route based on role
      if (location.pathname === "/dashboard") {
        if (userRole === "student") {
          navigate("exam-list");
        } else if (userRole === "admin") {
          navigate("students");
        }
      }
    } else {
      navigate("/login");
    }
  }, [user, navigate, location]);

  return (
    <div className="d-flex vh-100">
      {/* Sidebar - 20% */}
      <div
        style={{
          width: "20%",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRight: "1px solid #dee2e6",
        }}
      >
        <h5 className="text-center mb-4">
          {role === "admin"
            ? `Admin ${user?.student?.name}`
            : `Student ${user?.student?.name}`}
        </h5>
        <ListGroup>
          {role === "admin" && (
            <>
              <ListGroup.Item action as={Link} to="students">
                📌 Manage Students
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="exams">
                📝 Create & List Exams
              </ListGroup.Item>
            </>
          )}
          {role === "student" && (
            <>
              <ListGroup.Item action as={Link} to="exams">
                📝 Take Exam
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="exam-list">
                📜 All Taken Exams
              </ListGroup.Item>
            </>
          )}
        </ListGroup>
      </div>

      {/* Main Content - 80% */}
      <div style={{ width: "80%", padding: "30px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
