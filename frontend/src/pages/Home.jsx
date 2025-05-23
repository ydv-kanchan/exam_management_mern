import { Container } from "react-bootstrap";

const Home = () => {
  return (
    <Container
      fluid
      className="text-center py-5 px-3"
      style={{
        backgroundColor: "#ffffff", // white background
        color: "#000000", // black text
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: "10vh", // push content a bit down from top
      }}
    >
      <h1
        style={{
          fontSize: "3.5rem",
          fontWeight: "700",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Welcome to <span style={{ color: "#007bff" }}>Examify</span>
      </h1>
      <p
        style={{
          fontSize: "1.3rem",
          marginTop: "1rem",
          maxWidth: "700px",
          marginInline: "auto",
          color: "#333333",
        }}
      >
        Manage exams, results, and student performance efficiently with a
        streamlined, user-friendly platform built for educators.
      </p>
    </Container>
  );
};

export default Home;
