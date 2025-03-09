import { useState, useEffect } from "react"
import { Container, Card, Row, Col, Spinner, Alert, Nav, Tab, Badge } from "react-bootstrap"
import StudentDashboardNavbar from "../StudentComponents/StudentDashboardNavbar"
import "./Student.css"
import {
  FaUser,
  FaGraduationCap,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaVenusMars,
  FaSchool,
  FaUserGraduate,
  FaUserTie,
} from "react-icons/fa"

const StudentProfile = () => {
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
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token")

        const response = await fetch("/api/student/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setStudentData(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch profile")
        }
      } catch (error) {
        console.error("Error fetching student profile:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentProfile()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getFullName = () => {
    const middle = studentData.middleInitial ? `${studentData.middleInitial} ` : ""
    return `${studentData.firstName} ${middle}${studentData.lastName}`
  }

  if (loading) {
    return (
      <>
        <StudentDashboardNavbar />
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <h5 className="text-muted">Loading your profile...</h5>
          </div>
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <StudentDashboardNavbar />
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Profile</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please try refreshing the page or contact support if the issue persists.</p>
          </Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <StudentDashboardNavbar />
      <Container fluid className="py-4">
        <Container>
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-success text-white p-4">
                  <Row className="align-items-center">
                    <Col md={2} className="text-center mb-3 mb-md-0">
                      <div
                        className="bg-white rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <FaUserGraduate className="text-success" style={{ fontSize: "50px" }} />
                      </div>
                    </Col>
                    <Col md={10}>
                      <h1 className="display-6 fw-bold mb-1">{getFullName()}</h1>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <Badge bg="light" text="dark" className="fs-6">
                          <FaSchool className="me-1" /> {studentData.school.name}
                        </Badge>
                        <Badge bg="light" text="dark" className="fs-6">
                          <FaGraduationCap className="me-1" /> {studentData.yearLevel}
                        </Badge>
                        <Badge bg="light" text="dark" className="fs-6">
                          <FaIdCard className="me-1" /> {studentData.strand}
                        </Badge>
                      </div>
                      <p className="mb-0 lead">Student Profile • School Year: {studentData.school.year}</p>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>

          <Tab.Container id="profile-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Row>
              <Col lg={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Nav variant="tabs" className="nav-fill custom-nav">
                      <Nav.Item>
                        <Nav.Link eventKey="personal" className="py-3 rounded-0 border-0">
                          <FaUser className="me-2" /> Personal Information
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="academic" className="py-3 rounded-0 border-0">
                          <FaGraduationCap className="me-2" /> Academic Information
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="guardian" className="py-3 rounded-0 border-0">
                          <FaUserTie className="me-2" /> Guardian Information
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Tab.Content>
              <Tab.Pane eventKey="personal">
                <Row className="g-4">
                  <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Header className="bg-white border-bottom p-3">
                        <h5 className="mb-0 d-flex align-items-center">
                          <FaUser className="text-success me-2" /> Basic Information
                        </h5>
                      </Card.Header>
                      <Card.Body className="p-4">
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">First Name</label>
                              <p className="fw-medium mb-0">{studentData.firstName || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">Last Name</label>
                              <p className="fw-medium mb-0">{studentData.lastName || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">Middle Initial</label>
                              <p className="fw-medium mb-0">{studentData.middleInitial || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">
                                <FaVenusMars className="me-1" /> Gender
                              </label>
                              <p className="fw-medium mb-0">{studentData.gender || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">
                                <FaCalendarAlt className="me-1" /> Birthdate
                              </label>
                              <p className="fw-medium mb-0">{formatDate(studentData.birthdate)}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">
                                <FaPhone className="me-1" /> Contact Number
                              </label>
                              <p className="fw-medium mb-0">{studentData.contactNumber || "N/A"}</p>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Header className="bg-white border-bottom p-3">
                        <h5 className="mb-0 d-flex align-items-center">
                          <FaMapMarkerAlt className="text-success me-2" /> Location Information
                        </h5>
                      </Card.Header>
                      <Card.Body className="p-4">
                        <div className="mb-4">
                          <label className="text-muted small mb-1">Current Address</label>
                          <p className="fw-medium mb-0">{studentData.address || "N/A"}</p>
                        </div>

                        <h6 className="text-muted mb-3 border-bottom pb-2">Birthplace</h6>
                        <Row className="g-3">
                          <Col md={4}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">Province</label>
                              <p className="fw-medium mb-0">{studentData.birthplace.province || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">Municipality</label>
                              <p className="fw-medium mb-0">{studentData.birthplace.municipality || "N/A"}</p>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <label className="text-muted small mb-1">Barrio</label>
                              <p className="fw-medium mb-0">{studentData.birthplace.barrio || "N/A"}</p>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="academic">
                <Row>
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-white border-bottom p-3">
                        <h5 className="mb-0 d-flex align-items-center">
                          <FaGraduationCap className="text-success me-2" /> Academic Details
                        </h5>
                      </Card.Header>
                      <Card.Body className="p-4">
                        <Row className="g-4">
                          <Col md={6} lg={3}>
                            <Card className="border h-100 bg-light">
                              <Card.Body className="text-center p-4">
                                <div
                                  className="rounded-circle bg-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <FaSchool className="text-success fs-4" />
                                </div>
                                <h6 className="text-muted mb-2">School</h6>
                                <h5 className="fw-bold">{studentData.school.name}</h5>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6} lg={3}>
                            <Card className="border h-100 bg-light">
                              <Card.Body className="text-center p-4">
                                <div
                                  className="rounded-circle bg-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <FaCalendarAlt className="text-success fs-4" />
                                </div>
                                <h6 className="text-muted mb-2">School Year</h6>
                                <h5 className="fw-bold">{studentData.school.year || "N/A"}</h5>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6} lg={3}>
                            <Card className="border h-100 bg-light">
                              <Card.Body className="text-center p-4">
                                <div
                                  className="rounded-circle bg-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <FaUserGraduate className="text-success fs-4" />
                                </div>
                                <h6 className="text-muted mb-2">Year Level</h6>
                                <h5 className="fw-bold">{studentData.yearLevel || "N/A"}</h5>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6} lg={3}>
                            <Card className="border h-100 bg-light">
                              <Card.Body className="text-center p-4">
                                <div
                                  className="rounded-circle bg-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <FaIdCard className="text-success fs-4" />
                                </div>
                                <h6 className="text-muted mb-2">Section</h6>
                                <h5 className="fw-bold">{studentData.section || "N/A"}</h5>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <div className="mt-4 p-4 bg-light rounded-3">
                          <h5 className="mb-3">Academic Track</h5>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <FaGraduationCap className="fs-4" />
                            </div>
                            <div>
                              <h4 className="mb-1">{studentData.strand || "N/A"}</h4>
                              <p className="text-muted mb-0">Academic Strand</p>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="guardian">
                <Row>
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-white border-bottom p-3">
                        <h5 className="mb-0 d-flex align-items-center">
                          <FaUserTie className="text-success me-2" /> Guardian Information
                        </h5>
                      </Card.Header>
                      <Card.Body className="p-4">
                        <Row className="g-4 align-items-center">
                          <Col md={4} className="text-center">
                            <div
                              className="rounded-circle bg-light mx-auto mb-3 d-flex align-items-center justify-content-center"
                              style={{ width: "120px", height: "120px" }}
                            >
                              <FaUserTie className="text-success" style={{ fontSize: "60px" }} />
                            </div>
                            <h4 className="mb-1">{studentData.guardian?.name || "N/A"}</h4>
                            <p className="text-muted">Primary Guardian</p>
                          </Col>
                          <Col md={8}>
                            <Card className="border bg-light">
                              <Card.Body className="p-4">
                                <h5 className="mb-3 border-bottom pb-2">Guardian Details</h5>
                                <Row>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <label className="text-muted small mb-1">Full Name</label>
                                      <p className="fw-medium mb-0">{studentData.guardian?.name || "N/A"}</p>
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <label className="text-muted small mb-1">Occupation</label>
                                      <p className="fw-medium mb-0">{studentData.guardian?.occupation || "N/A"}</p>
                                    </div>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </Container>
    </>
  )
}

export default StudentProfile

