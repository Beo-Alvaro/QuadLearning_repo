import { useState, useEffect, useCallback } from "react"
import { Modal, Button, Form, Row, Col, Card, Spinner } from "react-bootstrap"
import { toast } from "react-toastify"

const UpdateStudentModal = ({ show, handleClose, studentId, token }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
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
      contactNumber: "",
      motherFullName: "",
      fatherFullName: "",
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
    lrn: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
        lrn: data.data.username || "",
        firstName: data.data.firstName || "",
        lastName: data.data.lastName || "",
        middleName: data.data.middleName || "",
        suffix: data.data.suffix || "",
        gender: data.data.gender || "",
        birthdate: data.data.birthdate ? data.data.birthdate.split("T")[0] : "",
        contactNumber: data.data.contactNumber || "",
        birthplace: {
          province: data.data.birthplace?.province || "",
          municipality: data.data.birthplace?.municipality || "",
          barrio: data.data.birthplace?.barrio || "",
        },
        address: data.data.address || "",
        guardian: {
          name: data.data.guardian?.name || "",
          occupation: data.data.guardian?.occupation || "",
          contactNumber: data.data.guardian?.contactNumber || "",
          motherFullName: data.data.guardian?.motherFullName || "",
          fatherFullName: data.data.guardian?.fatherFullName || "",
        },
        yearLevel: data.data.yearLevel || "",
        section: data.data.section || "",
        strand: data.data.strand || "",
        school: {
          name: data.data.school?.name || "Tropical Village National Highschool",
          year: data.data.school?.year || "",
        },
        attendance: {
          totalYears: data.data.attendance?.totalYears || "",
        },
      }))
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
    } finally {
      setIsLoading(false)
    }
  }, [studentId, token])

  useEffect(() => {
    if (show && studentId) {
      fetchStudentData()
      setIsEditing(false)
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
          middleName: formData.middleName,
          suffix: formData.suffix,
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
            motherFullName: formData.guardian?.motherFullName,
            fatherFullName: formData.guardian?.fatherFullName,
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
        setIsEditing(false)
        toast.success("Student information updated successfully!")
        await fetchStudentData()
      } else {
        throw new Error(data.message || "Failed to update student")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error("Failed to update student")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEditMode = (e) => {
    e.preventDefault()
    setIsEditing(!isEditing)
  }

  const getInitials = () => {
    const first = formData.firstName ? formData.firstName.charAt(0) : ""
    const last = formData.lastName ? formData.lastName.charAt(0) : ""
    return (first + last).toUpperCase()
  }

  const renderFormSection = (title, icon, children) => (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-success text-white py-3">
        <div className="d-flex align-items-center">
          <i className={`bi ${icon} me-2`}></i>
          <h5 className="mb-0 fw-semibold">{title}</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">{children}</Card.Body>
    </Card>
  )

  if (isLoading && !formData.firstName) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered className="student-modal">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Student Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="success" />
          <p className="mt-3 text-muted">Loading student information...</p>
        </Modal.Body>
      </Modal>
    )
  }
  const getMiddleInitial = (middleName) => {
    return middleName ? `${middleName.charAt(0)}.` : '';
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="student-modal">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title>
          <i className="bi bi-person-badge me-2 text-success"></i>
          Student Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <div className="student-header mb-4 pb-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="avatar me-3">
              <div className="initials-circle">{getInitials()}</div>
            </div>
            <div className="student-details">
  <h4 className="mb-1 fw-bold">
    {formData.firstName}{' '}
    {formData.middleName && getMiddleInitial(formData.middleName)}{' '}
    {formData.lastName}{' '}
    {formData.suffix}
  </h4>
              <div className="d-flex flex-wrap gap-2 mb-1">
                <span className="badge bg-light text-dark border">LRN: {formData.lrn}</span>
                <span className="badge bg-light text-dark border">
                  {formData.yearLevel} - {formData.section}
                </span>
                <span className="badge bg-success">{formData.strand}</span>
              </div>
            </div>
<div className="ms-auto">
  {isEditing ? (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        onClick={toggleEditMode}
        disabled={isLoading}
        size="sm"
        className="edit-button"
      >
        <i className="bi bi-x me-1"></i>
        Cancel
      </Button>
      <Button
        variant="success"
        onClick={handleSubmit}
        disabled={isLoading}
        size="sm"
        className="edit-button"
      >
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-1"
            />
            Saving...
          </>
        ) : (
          <>
            <i className="bi bi-check2 me-1"></i>
            Save Changes
          </>
        )}
      </Button>
    </div>
  ) : (
    <Button
      variant="outline-success"
      onClick={toggleEditMode}
      disabled={isLoading}
      size="sm"
      className="edit-button"
    >
      <i className="bi bi-pencil me-1"></i>
      Edit
    </Button>
  )}
</div>
          </div>
        </div>

        <Form onSubmit={handleSubmit} className="custom-form">
          {renderFormSection(
            "Personal Information",
            "bi-person-fill",
            <>
              <Row className="mb-3 g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label">First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label">Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label">Middle Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                <Form.Group>
                  <Form.Label className="form-label">Suffix</Form.Label>
                      <Form.Select
                        name="suffix"
                        value={formData.suffix || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={!isEditing ? "form-control-static" : ""}
                      >
                        <option value="">No Suffix</option>
                        {['Jr', 'Sr', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((suffix) => (
                          <option key={suffix} value={suffix}>
                            {suffix}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3 g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label">Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={!isEditing ? "form-control-static" : ""}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label">Birthdate</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthdate"
                      value={formData.birthdate || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label">Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Birthplace</Form.Label>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="birthplace.province"
                      placeholder="Province"
                      value={formData.birthplace?.province || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "form-control-static" : ""}
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
                      className={!isEditing ? "form-control-static" : ""}
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
                      className={!isEditing ? "form-control-static" : ""}
                    />
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "form-control-static" : ""}
                />
              </Form.Group>
            </>,
          )}

          {renderFormSection(
            "Guardian Information",
            "bi-people",
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="form-label">Guardian Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.name"
                    value={formData.guardian?.name || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="form-label">Guardian Occupation</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.occupation"
                    value={formData.guardian?.occupation || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">Guardian Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.contactNumber"
                    value={formData.guardian?.contactNumber || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">Mother's Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.motherFullName"
                    value={formData.guardian?.motherFullName || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">Father's Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian.fatherFullName"
                    value={formData.guardian?.fatherFullName || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "Academic Information",
            "bi-book",
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Year Level</Form.Label>
                  <Form.Control
                    type="text"
                    name="yearLevel"
                    value={formData.yearLevel || ""}
                    readOnly
                    disabled={!isEditing}
                    className="form-control-static"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Section</Form.Label>
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section || ""}
                    readOnly
                    disabled={!isEditing}
                    className="form-control-static"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Strand</Form.Label>
                  <Form.Control
                    type="text"
                    name="strand"
                    value={formData.strand || ""}
                    readOnly
                    disabled={!isEditing}
                    className="form-control-static"
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "School Information",
            "bi-building",
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">School Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="school.name"
                    value={formData.school?.name || "Tropical Village National Highschool"}
                    readOnly
                    disabled={!isEditing}
                    className="form-control-static"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">School Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="school.year"
                    value={formData.school?.year || ""}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                    className={!isEditing ? "form-control-static" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>,
          )}

          {renderFormSection(
            "Attendance Information",
            "bi-calendar-check",
            <Form.Group>
              <Form.Label className="form-label">Attendance for the whole semester</Form.Label>
              <Form.Control
                type="number"
                name="attendance.totalYears"
                value={formData.attendance?.totalYears || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "form-control-static" : ""}
              />
            </Form.Group>,
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
      <style jsx>{`
        /* Custom styling for the modal */
        .student-modal .modal-content {
          border: none;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        
        /* Student header styling */
        .student-header {
          position: relative;
        }
        
        /* Avatar styling */
        .initials-circle {
          width: 50px;
          height: 50px;
          background-color: #f0f4f8;
          border: 2px solid #e2e8f0;
          color: #4a5568;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 18px;
        }
        
        /* Badge styling */
        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
        }
        
        /* Form styling */
        .form-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        
        .form-control-static {
          background-color: #f8f9fa;
          border-color: #f8f9fa;
          color: #495057;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color:rgb(60, 64, 70);
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
        
        /* Button styling */
        .edit-button {
          font-weight: 500;
          font-size: 18px;
          padding: 5px 10px; /* Adjust as needed */
        }

        
        /* Card styling */
        .card {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .card-header {
          border-bottom: none;
        }
      `}</style>
    </Modal>
  )
}

export default UpdateStudentModal

