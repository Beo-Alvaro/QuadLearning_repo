import { useState, useEffect } from "react"
import { Container, Card, Row, Col, Spinner, Alert, Nav, Tab, Badge, Form, Button } from "react-bootstrap"
import StudentDashboardNavbar from "../StudentComponents/StudentDashboardNavbar"
import apiConfig from "../config/apiConfig"
import "./Student.css"
import { ToastContainer, toast } from 'react-toastify';
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
  FaEdit,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaHome,
  FaMapPin,
  FaGlobe,
  FaCity,
  FaMapMarkedAlt,
  FaBriefcase,
  FaUserShield,
} from "react-icons/fa"

const StudentProfile = () => {
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    suffix: "",
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
      contactNumber: "", // Added guardian contact number
      fatherFullName: "",
      motherFullName: "",
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
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const baseUrl = apiConfig.getBaseUrl();

        const response = await fetch(`${baseUrl}/student/profile`, {
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
          setFormData(result.data) // Initialize form data with student data
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
    return `${studentData.firstName} ${middle}${studentData.lastName} ${studentData.suffix}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data to original student data
      setFormData(studentData)
    }
    setIsEditing(!isEditing)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const baseUrl = apiConfig.getBaseUrl();

      const response = await fetch(`${baseUrl}/student/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setStudentData(formData)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        throw new Error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error.message)
    } finally {
      setUpdateLoading(false)
    }
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

  if (error && !isEditing) {
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
      <ToastContainer />
      <Container fluid className="py-4">
        <Container>
          {error && isEditing && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                  <div className="d-flex flex-column flex-md-row">
                    {/* Left sidebar with photo */}
                    <div className="bg-light p-4 text-center" style={{ width: "180px" }}>
                      <div
                        className="bg-white rounded-circle mx-auto d-flex align-items-center justify-content-center border shadow-sm"
                        style={{ width: "120px", height: "120px" }}
                      >
                        <FaUserGraduate className="text-success" style={{ fontSize: "50px" }} />
                      </div>
                      <div className="mt-3">
                        <div className="d-grid gap-2">
                          <Button
                            variant={isEditing ? "outline-danger" : "outline-success"}
                            size="sm"
                            onClick={handleEditToggle}
                            className="fw-medium"
                          >
                            {isEditing ? (
                              <>
                                <FaTimes className="me-1" /> Cancel
                              </>
                            ) : (
                              <>
                                <FaEdit className="me-1" /> Edit Profile
                              </>
                            )}
                          </Button>
                          {isEditing && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleSubmit}
                              disabled={updateLoading}
                              className="fw-medium"
                            >
                              {updateLoading ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FaSave className="me-1" /> Save
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main content area */}
                    <div className="p-4 flex-grow-1">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                        <div>
                          <h2 className="fw-bold mb-1">{getFullName()}</h2>
                          <p className="text-muted mb-0">
                            <span className="fw-medium ms-2">School Year:</span> {studentData.school.year || "N/A"}
                          </p>
                        </div>
                        <div className="mt-2 mt-md-0">
                          <span className="badge bg-success-subtle text-success px-3 py-2 fw-medium">
                            {studentData.strand || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <Row className="g-3">
                        <Col md={4}>
                            <div className="d-flex align-items-center">
                              <div className="me-3 text-success opacity-75">
                                <FaSchool size={16} />
                              </div>
                              <div>
                                <div className="text-muted small">School</div>
                                <div className="fw-medium">{studentData.school.name}</div>
                              </div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <div className="me-3 text-success opacity-75">
                                <FaGraduationCap size={16} />
                              </div>
                              <div>
                                <div className="text-muted small">Year Level</div>
                                <div className="fw-medium">{studentData.yearLevel || "N/A"}</div>
                              </div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <div className="me-3 text-success opacity-75">
                                <FaIdCard size={16} />
                              </div>
                              <div>
                                <div className="text-muted small">Section</div>
                                <div className="fw-medium">{studentData.section || "N/A"}</div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Form onSubmit={handleSubmit}>
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
                      <Card className="h-100 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <Card.Header className="bg-white border-bottom p-3">
                          <h5 className="mb-0 d-flex align-items-center">
                            <FaUser className="text-success me-2" /> Basic Information
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                          <Row className="g-3">
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaUser className="text-success me-1" size={12} /> First Name
                                </label>
                                {isEditing ? (
                                  <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ""}
                                    onChange={handleChange}
                                    className="border-success-subtle"
                                  />
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">
                                    {studentData.firstName || "N/A"}
                                  </p>
                                )}
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaUser className="text-success me-1" size={12} /> Last Name
                                </label>
                                {isEditing ? (
                                  <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ""}
                                    onChange={handleChange}
                                    className="border-success-subtle"
                                  />
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">{studentData.lastName || "N/A"}</p>
                                )}
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaUser className="text-success me-1" size={12} /> Middle Initial
                                </label>
                                {isEditing ? (
                                  <Form.Control
                                    type="text"
                                    name="middleInitial"
                                    value={formData.middleInitial || ""}
                                    onChange={handleChange}
                                    maxLength={1}
                                    className="border-success-subtle"
                                  />
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">
                                    {studentData.middleInitial || "N/A"}
                                  </p>
                                )}
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                  <label className="text-muted small mb-1 d-flex align-items-center">
                                      <FaUser className="text-success me-1" size={12} /> Suffix
                                  </label>
                                  {isEditing ? (
                                      <Form.Select
                                          name="suffix"
                                          value={formData.suffix || ''}
                                          onChange={handleChange}
                                          className="border-success-subtle"
                                      >
                                          <option value="">No Suffix</option>
                                          {['Jr', 'Sr', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((suffix) => (
                                              <option key={suffix} value={suffix}>
                                                  {suffix}
                                              </option>
                                          ))}
                                      </Form.Select>
                                  ) : (
                                      <p className="fw-medium mb-0 p-2 bg-light rounded">
                                          {studentData.suffix || 'N/A'}
                                      </p>
                                  )}
                              </div>
                          </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaVenusMars className="text-success me-1" size={12} /> Gender
                                </label>
                                {isEditing ? (
                                  <Form.Select
                                    name="gender"
                                    value={formData.gender || ""}
                                    onChange={handleChange}
                                    className="border-success-subtle"
                                  >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </Form.Select>
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">{studentData.gender || "N/A"}</p>
                                )}
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaCalendarAlt className="text-success me-1" size={12} /> Birthdate
                                </label>
                                {isEditing ? (
                                  <Form.Control
                                    type="date"
                                    name="birthdate"
                                    value={
                                      formData.birthdate ? new Date(formData.birthdate).toISOString().split("T")[0] : ""
                                    }
                                    onChange={handleChange}
                                    className="border-success-subtle"
                                  />
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">
                                    {formatDate(studentData.birthdate)}
                                  </p>
                                )}
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3 position-relative">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                  <FaPhone className="text-success me-1" size={12} /> Contact Number
                                </label>
                                {isEditing ? (
                               <Form.Control
                               type="text"
                               name="contactNumber"
                               value={formData.contactNumber || ""}
                               onChange={(e) => handleChange(e, 'contactNumber')}
                               placeholder="09XXXXXXXXX"
                               maxLength={11}
                               className="border-success-subtle"
                           />
                                ) : (
                                  <p className="fw-medium mb-0 p-2 bg-light rounded">
                                    {studentData.contactNumber || "N/A"}
                                  </p>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={6}>
                      <Card className="h-100 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <Card.Header className="bg-white border-bottom p-3">
                          <h5 className="mb-0 d-flex align-items-center">
                            <FaMapMarkerAlt className="text-success me-2" /> Location Information
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                          <div className="mb-4 position-relative">
                            <label className="text-muted small mb-1 d-flex align-items-center">
                              <FaHome className="text-success me-1" size={12} /> Current Address
                            </label>
                            {isEditing ? (
                              <Form.Control
                                type="text"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleChange}
                                className="border-success-subtle"
                              />
                            ) : (
                              <p className="fw-medium mb-0 p-2 bg-light rounded">{studentData.address || "N/A"}</p>
                            )}
                          </div>

                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-success mb-3 border-bottom pb-2 d-flex align-items-center">
                              <FaMapPin className="me-1" size={14} /> Birthplace
                            </h6>
                            <Row className="g-3">
                              <Col md={4}>
                                <div className="mb-3 position-relative">
                                  <label className="text-muted small mb-1 d-flex align-items-center">
                                    <FaGlobe className="text-success me-1" size={12} /> Province
                                  </label>
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="birthplace.province"
                                      value={formData.birthplace?.province || ""}
                                      onChange={handleChange}
                                      className="border-success-subtle"
                                    />
                                  ) : (
                                    <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                      {studentData.birthplace.province || "N/A"}
                                    </p>
                                  )}
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="mb-3 position-relative">
                                  <label className="text-muted small mb-1 d-flex align-items-center">
                                    <FaCity className="text-success me-1" size={12} /> Municipality
                                  </label>
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="birthplace.municipality"
                                      value={formData.birthplace?.municipality || ""}
                                      onChange={handleChange}
                                      className="border-success-subtle"
                                    />
                                  ) : (
                                    <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                      {studentData.birthplace.municipality || "N/A"}
                                    </p>
                                  )}
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="mb-3 position-relative">
                                  <label className="text-muted small mb-1 d-flex align-items-center">
                                    <FaMapMarkedAlt className="text-success me-1" size={12} /> Barrio
                                  </label>
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="birthplace.barrio"
                                      value={formData.birthplace?.barrio || ""}
                                      onChange={handleChange}
                                      className="border-success-subtle"
                                    />
                                  ) : (
                                    <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                      {studentData.birthplace.barrio || "N/A"}
                                    </p>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </div>
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
                          {isEditing && (
                            <div className="alert alert-info m-3 mb-0">
                              <small>
                                <FaInfoCircle className="me-2" />
                                Academic information can only be updated by school administrators.
                              </small>
                            </div>
                          )}
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
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="school.year"
                                      value={formData.school?.year || ""}
                                      disabled
                                      className="text-center fw-bold bg-light"
                                    />
                                  ) : (
                                    <h5 className="fw-bold">{studentData.school.year || "N/A"}</h5>
                                  )}
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
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="yearLevel"
                                      value={formData.yearLevel || ""}
                                      disabled
                                      className="text-center fw-bold bg-light"
                                    />
                                  ) : (
                                    <h5 className="fw-bold">{studentData.yearLevel || "N/A"}</h5>
                                  )}
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
                                  {isEditing ? (
                                    <Form.Control
                                      type="text"
                                      name="section"
                                      value={formData.section || ""}
                                      disabled
                                      className="text-center fw-bold bg-light"
                                    />
                                  ) : (
                                    <h5 className="fw-bold">{studentData.section || "N/A"}</h5>
                                  )}
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
                              <div className="flex-grow-1">
                                {isEditing ? (
                                  <Form.Control
                                    type="text"
                                    name="strand"
                                    value={formData.strand || ""}
                                    disabled
                                    className="mb-1 fw-bold fs-4 bg-light"
                                  />
                                ) : (
                                  <h4 className="mb-1">{studentData.strand || "N/A"}</h4>
                                )}
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
                              {isEditing ? (
                                <Form.Control
                                  type="text"
                                  name="guardian.name"
                                  value={formData.guardian?.name || ""}
                                  onChange={handleChange}
                                  className="mb-1 text-center fw-bold fs-4"
                                />
                              ) : (
                                <h4 className="mb-1">{studentData.guardian?.name || "N/A"}</h4>
                              )}
                              <p className="text-muted">Primary Guardian</p>
                            </Col>
                            <Col md={8}>
                              <Card className="border bg-light shadow-sm">
                                <Card.Body className="p-4">
                                  <h5 className="mb-3 border-bottom pb-2 text-success d-flex align-items-center">
                                    <FaUserTie className="me-2" /> Guardian Details
                                  </h5>
                                  <Row className="g-3">
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaUser className="text-success me-1" size={12} /> Full Name
                                        </label>
                                        {isEditing ? (
                                          <Form.Control
                                            type="text"
                                            name="guardian.name"
                                            value={formData.guardian?.name || ""}
                                            onChange={handleChange}
                                            className="border-success-subtle bg-white"
                                          />
                                        ) : (
                                          <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                            {studentData.guardian?.name || "N/A"}
                                          </p>
                                        )}
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaBriefcase className="text-success me-1" size={12} /> Occupation
                                        </label>
                                        {isEditing ? (
                                          <Form.Control
                                            type="text"
                                            name="guardian.occupation"
                                            value={formData.guardian?.occupation || ""}
                                            onChange={handleChange}
                                            className="border-success-subtle bg-white"
                                          />
                                        ) : (
                                          <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                            {studentData.guardian?.occupation || "N/A"}
                                          </p>
                                        )}
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaPhone className="text-success me-1" size={12} /> Contact Number
                                        </label>
                                        {isEditing ? (
                                         <Form.Control
                                         type="text"
                                         name="guardian.contactNumber"
                                         value={formData.guardian?.contactNumber || ""}
                                         onChange={(e) => handleChange(e, 'guardian.contactNumber')}
                                         placeholder="09XXXXXXXXX"
                                         maxLength={11}
                                         className="border-success-subtle bg-white"
                                     />
                                        ) : (
                                          <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                            {studentData.guardian?.contactNumber || "N/A"}
                                          </p>
                                        )}
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaUserShield className="text-success me-1" size={12} /> Relationship
                                        </label>
                                        <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                          Primary Guardian
                                        </p>
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaUser className="text-success me-1" size={12} />Mother's Full Name
                                        </label>
                                        {isEditing ? (
                                          <Form.Control
                                            type="text"
                                            name="guardian.motherFullName"
                                            value={formData.guardian?.motherFullName || ""}
                                            onChange={handleChange}
                                            className="border-success-subtle bg-white"
                                          />
                                        ) : (
                                          <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                            {studentData.guardian?.motherFullName || "N/A"}
                                          </p>
                                        )}
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3 position-relative">
                                        <label className="text-muted small mb-1 d-flex align-items-center">
                                          <FaUser className="text-success me-1" size={12} />Father's Full Name
                                        </label>
                                        {isEditing ? (
                                          <Form.Control
                                            type="text"
                                            name="guardian.fatherFullName"
                                            value={formData.guardian?.fatherFullName || ""}
                                            onChange={handleChange}
                                            className="border-success-subtle bg-white"
                                          />
                                        ) : (
                                          <p className="fw-medium mb-0 p-2 bg-white rounded shadow-sm">
                                            {studentData.guardian?.fatherFullName || "N/A"}
                                          </p>
                                        )}
                                      </div>
                                    </Col>
                                  </Row>
                                  <div className="alert alert-success mt-3 mb-0">
                                    <small className="d-flex align-items-center">
                                      <FaInfoCircle className="me-2" />
                                      Guardian information is important for school communications and emergencies.
                                    </small>
                                  </div>
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
          </Form>
        </Container>
      </Container>
    </>
  )
}

export default StudentProfile

