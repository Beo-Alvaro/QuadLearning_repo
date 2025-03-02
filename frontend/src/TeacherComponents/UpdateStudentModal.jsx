import { useState, useEffect, useCallback } from "react"
import { Modal, Button, Form, Row, Col, Card, Spinner, Alert } from "react-bootstrap"

const UpdateStudentModal = ({ show, handleClose, studentId, token }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    gender: "",
    birthdate: "",
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
    attendance: {
      totalYears: "",
    },
    contactNumber: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const fetchStudentData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teacher/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch student data")
      }

      const data = await response.json()

      setFormData((prevData) => ({
        ...prevData,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleInitial: data.middleInitial || "",
        gender: data.gender || "",
        birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
        contactNumber: data.contactNumber || "",
        birthplace: {
          province: data.birthplace?.province || "",
          municipality: data.birthplace?.municipality || "",
          barrio: data.birthplace?.barrio || "",
        },
        address: data.address || "",
        guardian: {
          name: data.guardian?.name || "",
          occupation: data.guardian?.occupation || "",
        },
        yearLevel: data.yearLevel?.name || data.yearLevel || data.yearLevelName || prevData.yearLevel || "",
        section: data.section?.name || data.section || data.sectionName || prevData.section || "",
        strand: data.strand?.name || data.strand || data.strandName || prevData.strand || "",
        school: {
          name: data.school?.name || "Tropical Village National Highschool",
          year: data.school?.year || "",
        },
        attendance: {
          totalYears: data.attendance?.totalYears || "",
        },
      }))
    } catch (error) {
      console.error("Error fetching student data:", error)
      setMessage({
        type: "danger",
        text: "Failed to load student data: " + error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [studentId, token])

  useEffect(() => {
    if (show && studentId) {
      fetchStudentData()
      setIsEditing(false)
      setMessage({ type: "", text: "" })
    }
  }, [show, studentId, fetchStudentData])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const formattedGender = formData.gender
        ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase()
        : undefined

      const response = await fetch(`/api/teacher/student/${studentId}/form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: studentId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleInitial: formData.middleInitial,
          gender: formattedGender,
          birthdate: formData.birthdate,
          birthplace: {
            province: formData.birthplace.province,
            municipality: formData.birthplace.municipality,
            barrio: formData.birthplace.barrio,
          },
          yearLevel: formData.yearLevel,
          section: formData.section,
          strand: formData.strand,
          address: formData.address,
          guardian: {
            name: formData.guardian?.name,
            occupation: formData.guardian?.occupation,
          },
          school: {
            name: "Tropical Village National Highschool",
            year: formData.school?.year,
          },
          attendance: {
            totalYears: formData.attendance?.totalYears,
          },
          contactNumber: formData.contactNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update student")
      }

      const data = await response.json()
      if (data.success) {
        setMessage({
          type: "success",
          text: "Student information updated successfully",
        })
        setIsEditing(false)
        await fetchStudentData()
      } else {
        throw new Error(data.message || "Failed to update student")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      setMessage({
        type: "danger",
        text: "Failed to update student: " + error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEditMode = (e) => {
    e.preventDefault()
    setIsEditing(!isEditing)
  }

  const renderFormSection = (title, children) => (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )

  if (isLoading && !formData.firstName) {
    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Student Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading student information...</p>
        </Modal.Body>
      </Modal>
    )
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bi bi-person-badge me-2"></i>
          Update Student Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        {message.text && (
          <Alert variant={message.type} dismissible onClose={() => setMessage({ type: "", text: "" })}>
            {message.text}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            {formData.firstName} {formData.lastName}
          </h4>
          <Button
            variant={isEditing ? "outline-secondary" : "outline-primary"}
            onClick={toggleEditMode}
            disabled={isLoading}
          >
            {isEditing ? "Cancel Editing" : "Edit Information"}
          </Button>
        </div>

        <Form onSubmit={handleSubmit}>
          {renderFormSection(
            "Personal Information",
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Middle Initial</Form.Label>
                    <Form.Control
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Birthdate</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthdate"
                      value={formData.birthdate || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Birthplace</Form.Label>
                <Row>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="birthplace.province"
                      placeholder="Province"
                      value={formData.birthplace?.province || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="birthplace.municipality"
                      placeholder="Municipality"
                      value={formData.birthplace?.municipality || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="birthplace.barrio"
                      placeholder="Barrio"
                      value={formData.birthplace?.barrio || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Form.Group>
            </>,
          )}

          {renderFormSection(
            "Guardian Information",
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guardian Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.name"
                    value={formData.guardian?.name || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guardian Occupation</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.occupation"
                    value={formData.guardian?.occupation || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "Academic Information",
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Year Level</Form.Label>
                  <Form.Control
                    type="text"
                    name="yearLevel"
                    value={formData.yearLevel || ""}
                    readOnly
                    disabled={!isEditing}
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Section</Form.Label>
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section || ""}
                    readOnly
                    disabled={!isEditing}
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Strand</Form.Label>
                  <Form.Control
                    type="text"
                    name="strand"
                    value={formData.strand || ""}
                    readOnly
                    disabled={!isEditing}
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "School Information",
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>School Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="school.name"
                    value={formData.school?.name || "Tropical Village National Highschool"}
                    readOnly
                    disabled={!isEditing}
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>School Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="school.year"
                    value={formData.school?.year || ""}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "Attendance Information",
            <Form.Group className="mb-3">
              <Form.Label>Attendance for the whole semester</Form.Label>
              <Form.Control
                type="number"
                name="attendance.totalYears"
                value={formData.attendance?.totalYears || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>,
          )}

          {isEditing && (
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={toggleEditMode} className="me-2" disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Updating...
                  </>
                ) : (
                  "Update Student"
                )}
              </Button>
            </div>
          )}
        </Form>
      </Modal.Body>
      {!isEditing && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default UpdateStudentModal

