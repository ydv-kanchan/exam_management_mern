import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div style={styles.navbar}>
      <div>
        <Link to="/" style={styles.brand}>
          Examify
        </Link>
      </div>

      <div style={styles.linksContainer}>
        {user ? (
          <>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    width: "100%",
    height: "64px",
    backgroundColor: "#ffffff",
    color: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#000000",
    textDecoration: "none",
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    color: "#000000",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "color 0.3s",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Navbar;
