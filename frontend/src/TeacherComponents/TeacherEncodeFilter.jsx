import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
const TeacherEncodeGradeFilter = ({
  successMessage,
  error,
  loading,
  currentSemester,
  selectedSubject,
  showAdvisoryOnly,
  selectedStrand,
  selectedYearLevel,
  selectedSection,
  semesters,
  subjects,
  strands,
  yearLevels,
  availableSections,
  setSuccessMessage,
  setError,
  setCurrentSemester,
  setSelectedSubject,
  setShowAdvisoryOnly,
  setSelectedStrand,
  setSelectedYearLevel,
  setSelectedSection
}) => {
  // Filter subjects based on the selected semester
  const filteredSubjects = subjects.filter(subject => {
    if (!currentSemester) return false;
    
    // Check if subject has semester property and it matches current semester
    return subject.semester && 
           (typeof subject.semester === 'object' 
             ? subject.semester._id === currentSemester 
             : subject.semester === currentSemester);
  });

  // Debug logs to help troubleshoot
  console.log('Current semester:', currentSemester);
  console.log('All subjects:', subjects);
  console.log('Filtered subjects:', filteredSubjects);
  console.log('Available semesters:', semesters);

  return (
    <div>
      {/* Alerts */}
      {successMessage && (
        <Alert 
          variant="success" 
          onClose={() => setSuccessMessage('')} 
          dismissible 
          className="mb-3"
        >
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert 
          variant="danger" 
          onClose={() => setError('')} 
          dismissible 
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      {/* Semester and Subject Selection */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Select
                  value={currentSemester || ''}
                  onChange={(e) => {
                    console.log('Selecting semester:', e.target.value);
                    // Clear selected subject when changing semester
                    setSelectedSubject('');
                    setCurrentSemester(e.target.value);
                  }}
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  {semesters
                    .filter(semester => semester.status === 'active') // Only show active semesters
                    .map(semester => {
                      const semesterName = semester.name || 'Unnamed Semester';
                      const strandName = semester.strand?.name || 'No Strand';
                      const yearLevelName = semester.yearLevel?.name || 'No Year Level';
                      return (
                        <option key={semester._id} value={semester._id}>
                          {`${semesterName} - ${strandName} - ${yearLevelName}`}
                        </option>
                      );
                    })}
                </Form.Select>
                <Form.Text className="text-muted">
                  Only active semesters are displayed. Contact admin if your semester is missing.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {currentSemester && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    value={selectedSubject || ''}
                    onChange={(e) => {
                      console.log('Selected subject:', e.target.value);
                      setSelectedSubject(e.target.value);
                    }}
                    disabled={!currentSemester || loading}
                  >
                    <option value="">Choose Subject</option>
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No subjects available for this semester</option>
                    )}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Only showing subjects for the selected semester
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Advisory View and Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check 
              type="switch"
              id="advisory-switch"
              label={<span className="fw-bold">Show Only Advisory Class</span>}
              checked={showAdvisoryOnly}
              onChange={(e) => {
                setShowAdvisoryOnly(e.target.checked);
                if (e.target.checked) {
                  setSelectedStrand('');
                  setSelectedYearLevel('');
                  setSelectedSection('');
                }
              }}
              className="mb-0"
            />
            {!showAdvisoryOnly && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  setSelectedStrand('');
                  setSelectedYearLevel('');
                  setSelectedSection('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {!showAdvisoryOnly && (
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-funnel me-1"></i> Strand
                  </Form.Label>
                  <Form.Select
                    value={selectedStrand}
                    onChange={(e) => setSelectedStrand(e.target.value)}
                    className="shadow-sm"
                  >
                    <option value="">All Strands</option>
                    {strands.map((strand, index) => (
                      <option key={index} value={strand}>
                        {strand}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-calendar me-1"></i> Year Level
                  </Form.Label>
                  <Form.Select
                    value={selectedYearLevel}
                    onChange={(e) => setSelectedYearLevel(e.target.value)}
                    className="shadow-sm"
                  >
                    <option value="">All Year Levels</option>
                    {yearLevels.map((yearLevel, index) => (
                      <option key={index} value={yearLevel}>
                        {yearLevel}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-people me-1"></i> Section
                  </Form.Label>
                  <Form.Select
                   value={selectedSection}
                   onChange={e => setSelectedSection(e.target.value)}
                    className="shadow-sm"
                  >
                    <option value="">All Sections</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>
                          {section}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeacherEncodeGradeFilter;
