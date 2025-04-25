import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Container, Card, Row, Col, Spinner } from "react-bootstrap"
import { User, BarChart2, MessageCircle } from "lucide-react"
import StudentDashboardNavbar from "../StudentComponents/StudentDashboardNavbar"
import "./StudentHomeScreen.css"

const StudentHomeScreen = () => {
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    gender: "",
    birthdate: "",
    contactNumber: "",
    birthplace: {
      province: "",
      municipality: "",
      barrio: "",
    },
    address: "",
    guardian: {
      name: "",
      occupation: "",
    },
    yearLevel: "",
    section: "",
    strand: "",
    school: {
      name: "Tropical Village National Highschool",
      year: "",
    },
    grades: {
      subjects: [],
      semester: "",
    },
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("/api/student/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            if (result.success) {
                setStudentData(result.data);
            } else {
                throw new Error(result.message || "Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching student profile:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchStudentProfile();
}, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>
  }

  return (
    <>
      <StudentDashboardNavbar />
      <Container className="mt-4">
        <Row>
          <Col lg={8}>
            <Card className="welcome-card mb-4">
              <Card.Body>
                <Card.Title as="h2">
                  Welcome, {studentData.firstName} {studentData.lastName}!
                </Card.Title>
                <Card.Text>
                  You are currently enrolled in {studentData.yearLevel} {studentData.strand}. Stay focused, keep
                  learning, and make the most of your academic journey.
                </Card.Text>
              </Card.Body>
            </Card>

            <Card className="subjects-card">
              <Card.Header as="h4">Current Semester Subjects</Card.Header>
              <Card.Body>
    {studentData.grades?.subjects?.length > 0 ? (
        studentData.grades.subjects.map((subject, index) => (
            <div key={index} className="subject-item">
                <h5>{subject.name || 'Unknown Subject'}</h5>
                <p>
                    <strong>Code:</strong> {subject.code || 'N/A'} |
                    <strong>Section:</strong> {subject.section || 'N/A'} - {subject.yearLevel || 'N/A'}
                </p>
            </div>
        ))
    ) : (
        <div>
            <p>No subjects found for this semester.</p>
        </div>
    )}
</Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="quick-actions-card">
              <Card.Header as="h4">Quick Actions</Card.Header>
              <Card.Body>
                <Link to="/login/StudentScreens/StudentProfile" className="quick-action-link">
                  <div className="quick-action-item profile">
                    <User size={40} />
                    <div>
                      <h5>View Profile</h5>
                      <p>Manage your personal information</p>
                    </div>
                  </div>
                </Link>
                <Link to="/login/StudentScreens/StudentViewGrades" className="quick-action-link">
                  <div className="quick-action-item grades">
                    <BarChart2 size={40} />
                    <div>
                      <h5>View Grades</h5>
                      <p>Check your academic performance</p>
                    </div>
                  </div>
                </Link>
                <Link to="/login/StudentScreens/StudentMessages" className="quick-action-link">
                  <div className="quick-action-item messages">
                    <MessageCircle size={40} />
                    <div>
                      <h5>Send a Message</h5>
                      <p>Communicate with the admin</p>
                    </div>
                  </div>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default StudentHomeScreen

