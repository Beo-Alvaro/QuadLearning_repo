import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import apiConfig from '../config/apiConfig';

const TeacherEncodeGradeFilter = ({
  successMessage,
  error,
  loading,
  currentSemester,
  selectedSubject,
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
  setSelectedStrand,
  setSelectedYearLevel,
  setSelectedSection
}) => {
  // Add state for directly fetched subjects
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectError, setSubjectError] = useState(null);


  // Add useEffect for fetching subjects when semester changes
useEffect(() => {
  const fetchSubjectsForSemester = async () => {
    if (!currentSemester) {
      setSemesterSubjects([]);
      return;
    }
    
    setLoadingSubjects(true);
    setSubjectError(null);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = apiConfig.getBaseUrl();
      const response = await axios.get(
        `${baseUrl}/teacher/subjects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            semesterId: currentSemester
          }
        }
      );
      
      console.log('Subjects response:', response.data);
      
      if (Array.isArray(response.data)) {
        setSemesterSubjects(response.data);
        // Reset selected subject when subjects change
        setSelectedSubject('');
      } else {
        console.warn('Unexpected subjects data format:', response.data);
        setSemesterSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectError('Failed to load subjects');
      setSemesterSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  fetchSubjectsForSemester();
}, [currentSemester, setSelectedSubject]);

  // Debug logs
  console.log('Current semester ID:', currentSemester);
  console.log('Directly fetched subjects:', semesterSubjects);
  console.log('All subjects from props:', subjects);
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
      {subjectError && (
        <Alert 
          variant="warning" 
          onClose={() => setSubjectError(null)} 
          dismissible 
          className="mb-3"
        >
          {subjectError}
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
                    const selectedSemesterId = e.target.value;
                    console.log('Selecting semester:', selectedSemesterId);
                    
                    // Clear selected subject when changing semester
                    setSelectedSubject('');
                    setCurrentSemester(selectedSemesterId);
                  }}
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  {semesters
                    .filter(semester => semester.status === 'active') // Only show active semesters
                    .map(semester => {
                      const semesterName = semester.name || 'Unnamed Semester';
                      const strandName = semester.strand?.name || '';
                      const yearLevelName = semester.yearLevel?.name || '';
                      
                      // Format the display text with only available information
                      let displayText = semesterName;
                      
                      if (strandName && yearLevelName) {
                        displayText += ` - ${strandName} - ${yearLevelName}`;
                      } else if (strandName) {
                        displayText += ` - ${strandName}`;
                      } else if (yearLevelName) {
                        displayText += ` - ${yearLevelName}`;
                      }
                      
                      return (
                        <option key={semester._id} value={semester._id}>
                          {displayText}
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
    {loadingSubjects ? (
        <div className="text-center py-2">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading subjects...
        </div>
    ) : (
        <>
            <Form.Select
                value={selectedSubject}
                onChange={(e) => {
                    console.log('Selected subject:', e.target.value);
                    setSelectedSubject(e.target.value);
                }}
                disabled={!currentSemester || loading || loadingSubjects}
            >
                <option value="">Choose Subject</option>
                {semesterSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code || 'No Code'})
                    </option>
                ))}
            </Form.Select>
            {subjectError && (
                <Form.Text className="text-danger">
                    {subjectError}
                </Form.Text>
            )}
            {semesterSubjects.length === 0 && !subjectError && (
                <Form.Text className="text-muted">
                    No subjects available for this semester
                </Form.Text>
            )}
        </>
    )}
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
          </div>
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeacherEncodeGradeFilter;
