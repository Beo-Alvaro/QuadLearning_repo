"use client"

import { useState, useEffect } from "react"
import { Container, Card, Table, Alert, Spinner, Nav, Row, Col, Badge, ProgressBar, Accordion } from "react-bootstrap"
import { BookOpen, Calendar, Award, BarChart2 } from "lucide-react"
import StudentDashboardNavbar from "../StudentComponents/StudentDashboardNavbar"
import "./student-view.css"

const StudentViewGrades = () => {
  const [grades, setGrades] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeYearLevel, setActiveYearLevel] = useState(null)
  const [yearLevels, setYearLevels] = useState([])
  const [groupedGrades, setGroupedGrades] = useState({})

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Attempting to fetch grades with token:", token)

        const response = await fetch("/api/student/grades", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        console.log("Response status:", response.status)

        const data = await response.json()
        console.log("Response data:", data)

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch grades")
        }

        if (data.success) {
          setGrades(data.data)
          organizeGradesByYearAndSemester(data.data)
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error("Detailed error:", error)
        setError(error.message || "An error occurred while fetching grades")
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  // Function to organize grades by year level and semester
  const organizeGradesByYearAndSemester = (gradesData) => {
    // gradesData is now an array of { yearLevel, semesters } objects
    const yearLevelMap = {}

    gradesData.forEach(({ yearLevel, semesters }) => {
      if (!yearLevelMap[yearLevel]) {
        yearLevelMap[yearLevel] = []
      }
      yearLevelMap[yearLevel].push(...semesters)
    })

    // Sort year levels (Grade 11 before Grade 12)
    const sortedYearLevels = Object.keys(yearLevelMap).sort((a, b) => {
      const aNum = Number.parseInt(a.match(/\d+/)?.[0] || 0)
      const bNum = Number.parseInt(b.match(/\d+/)?.[0] || 0)
      return aNum - bNum
    })

    // Sort semesters within each year level
    const sortedData = sortedYearLevels.reduce((acc, year) => {
      acc[year] = yearLevelMap[year].sort((a, b) => {
        // Extract semester numbers (1st, 2nd) for sorting
        const aNum = Number.parseInt(a.name.match(/(\d+)/)?.[1] || 0)
        const bNum = Number.parseInt(b.name.match(/(\d+)/)?.[1] || 0)
        return aNum - bNum
      })
      return acc
    }, {})

    setYearLevels(sortedYearLevels)
    setGroupedGrades(sortedData)

    if (sortedYearLevels.length > 0 && !activeYearLevel) {
      setActiveYearLevel(sortedYearLevels[0])
    }
  }

  // Calculate semester GPA
  const calculateSemesterGPA = (subjects) => {
    if (!subjects || subjects.length === 0) return 0

    const sum = subjects.reduce((total, subject) => total + Number.parseFloat(subject.finalRating || 0), 0)
    return (sum / subjects.length).toFixed(2)
  }

  // Get performance color based on grade
  const getPerformanceColor = (rating) => {
    if (rating >= 90) return "success"
    if (rating >= 80) return "info"
    if (rating >= 75) return "warning"
    return "danger"
  }

  if (loading) {
    return (
      <>
        <StudentDashboardNavbar />
        <Container className="d-flex justify-content-center align-items-center mt-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading your academic records...</p>
          </div>
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <StudentDashboardNavbar />
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Grades</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <StudentDashboardNavbar />
      <Container fluid className="py-4 grades-container">
        <Row>
          <Col>
            <h2 className="mb-4 page-title">
              <BookOpen className="me-2" size={24} />
              Academic Records
            </h2>
          </Col>
        </Row>

        {grades.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Records Found</Alert.Heading>
            <p>No grades are available at this time. Check back later or contact your instructor.</p>
          </Alert>
        ) : (
          <>
            {/* Year Level Navigation */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-white">
                <Nav variant="tabs" className="year-level-tabs">
                  {yearLevels.map((yearLevel) => (
                    <Nav.Item key={yearLevel}>
                      <Nav.Link
                        active={activeYearLevel === yearLevel}
                        onClick={() => setActiveYearLevel(yearLevel)}
                        className="d-flex align-items-center"
                      >
                        <Calendar size={16} className="me-2" />
                        {yearLevel}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Header>
            </Card>

            {/* Semesters for the active year level */}
            {activeYearLevel && groupedGrades[activeYearLevel] && (
              <Accordion defaultActiveKey="0" className="semester-accordion">
                {groupedGrades[activeYearLevel].map((semester, index) => {
                  const semesterGPA = calculateSemesterGPA(semester.subjects)
                  const performanceColor = getPerformanceColor(semesterGPA)

                  return (
                    <Accordion.Item key={index} eventKey={index.toString()} className="mb-4 shadow-sm">
                      <Accordion.Header>
                        <div className="semester-header w-100">
                          <div>
                            <h5 className="semester-title">{semester.name}</h5>
                            <p className="semester-subtitle">{semester.strand}</p>
                          </div>
                          <div className="gpa-badge">
                            <Award size={16} />
                            <span>GPA: {semesterGPA}</span>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <Card.Body>
                          <Row className="mb-3">
                            <Col md={12}>
                              <div className="performance-summary p-3 bg-light rounded">
                                <h6 className="mb-3">
                                  <BarChart2 size={16} className="me-2" />
                                  Grade Distribution
                                </h6>

                                <div className="grade-distribution">
                                  {/* Excellent */}
                                  <div className="grade-category">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="grade-label">Excellent (90+)</span>
                                      <span className="grade-count">
                                        {semester.subjects.filter((s) => s.finalRating >= 90).length} subjects
                                      </span>
                                    </div>
                                    <ProgressBar
                                      variant="success"
                                      now={
                                        (semester.subjects.filter((s) => s.finalRating >= 90).length /
                                          semester.subjects.length) *
                                        100
                                      }
                                      className="mb-2"
                                    />
                                  </div>

                                  {/* Good */}
                                  <div className="grade-category">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="grade-label">Good (80-89)</span>
                                      <span className="grade-count">
                                        {
                                          semester.subjects.filter((s) => s.finalRating >= 80 && s.finalRating < 90)
                                            .length
                                        }{" "}
                                        subjects
                                      </span>
                                    </div>
                                    <ProgressBar
                                      variant="info"
                                      now={
                                        (semester.subjects.filter((s) => s.finalRating >= 80 && s.finalRating < 90)
                                          .length /
                                          semester.subjects.length) *
                                        100
                                      }
                                      className="mb-2"
                                    />
                                  </div>

                                  {/* Satisfactory */}
                                  <div className="grade-category">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="grade-label">Satisfactory (75-79)</span>
                                      <span className="grade-count">
                                        {
                                          semester.subjects.filter((s) => s.finalRating >= 75 && s.finalRating < 80)
                                            .length
                                        }{" "}
                                        subjects
                                      </span>
                                    </div>
                                    <ProgressBar
                                      variant="warning"
                                      now={
                                        (semester.subjects.filter((s) => s.finalRating >= 75 && s.finalRating < 80)
                                          .length /
                                          semester.subjects.length) *
                                        100
                                      }
                                      className="mb-2"
                                    />
                                  </div>

                                  {/* Needs Improvement */}
                                  <div className="grade-category">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="grade-label">Needs Improvement (Below 75)</span>
                                      <span className="grade-count">
                                        {semester.subjects.filter((s) => s.finalRating < 75).length} subjects
                                      </span>
                                    </div>
                                    <ProgressBar
                                      variant="danger"
                                      now={
                                        (semester.subjects.filter((s) => s.finalRating < 75).length /
                                          semester.subjects.length) *
                                        100
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="text-center mt-3">
                                  <small className="text-muted">
                                    Total: {semester.subjects.length} subjects | Passing:{" "}
                                    {semester.subjects.filter((s) => s.finalRating >= 75).length} | Failing:{" "}
                                    {semester.subjects.filter((s) => s.finalRating < 75).length}
                                  </small>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          <Table responsive hover className="grades-table">
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Code</th>
                                <th>Midterm</th>
                                <th>Finals</th>
                                <th>Final Rating</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semester.subjects.map((subject, idx) => (
                                <tr key={idx}>
                                  <td className="subject-name">{subject.name}</td>
                                  <td>{subject.code}</td>
                                  <td>{subject.midterm}</td>
                                  <td>{subject.finals}</td>
                                  <td>
                                    <Badge bg={getPerformanceColor(subject.finalRating)} className="grade-badge">
                                      {subject.finalRating}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge
                                      bg={subject.finalRating >= 75 ? "success" : "danger"}
                                      className="remarks-badge"
                                    >
                                      {subject.finalRating >= 75 ? "PASSED" : "FAILED"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Accordion.Body>
                    </Accordion.Item>
                  )
                })}
              </Accordion>
            )}
          </>
        )}
      </Container>
    </>
  )
}

export default StudentViewGrades

