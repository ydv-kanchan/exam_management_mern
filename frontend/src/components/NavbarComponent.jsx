import { Navbar, Nav, Container, Button } from "react-bootstrap";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const NavbarComponent = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Custom button style
  const buttonStyle = {
    borderRadius: "30px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    padding: "8px 20px",
    border: "2px solid #ffffff",
    color: "#ffffff",
    backgroundColor: "transparent",
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = "#ffffff20"; // subtle light overlay
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = "transparent";
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand
          href="/dashboard"
          style={{ fontWeight: "bold", fontSize: "1.5rem" }}
        >
          Examify
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            {user ? (
              <Button
                variant="danger"
                onClick={handleLogout}
                className="ms-3"
                style={{
                  borderRadius: "30px",
                  fontWeight: "600",
                  padding: "8px 20px",
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Nav.Link href="/login" className="ms-3">
                  <Button
                    variant="outline-light"
                    style={buttonStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                  >
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link href="/register" className="ms-2">
                  <Button
                    variant="outline-light"
                    style={buttonStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                  >
                    Register
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
