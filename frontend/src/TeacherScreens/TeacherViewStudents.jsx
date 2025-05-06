import { useState, useEffect, useMemo } from 'react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { Container, Form, Row, Col, Button, Badge, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTeacherUserContext } from '../hooks/useTeacherUserContext';
import UpdateStudentModal from '../TeacherComponents/UpdateStudentModal';
import './TeacherViewStudent.css';
import TeacherStudentTable from '../TeacherComponents/TeacherStudentTable';
import { ToastContainer, toast } from 'react-toastify';
import HealthCheck from '../components/HealthCheck';

const TeacherViewStudents = () => {
    const [availableSections, setAvailableSections] = useState([]);
    const [showAdvisoryOnly, setShowAdvisoryOnly] = useState(false);
    

    // Selected filter states
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);


    const { sections, strands, yearLevels, loading, error, fetchData } = useTeacherUserContext();

    useEffect(() => {
        try {
            console.log('TeacherViewStudents: Fetching data');
            fetchData();
        } catch (err) {
            console.error('TeacherViewStudents: Error fetching data:', err);
            toast.error('Failed to load teacher data: ' + err.message);
        }
    }, [fetchData]);

    const handleViewStudent = (student) => {
        try {
            // Make sure we're passing the user ID, not the student record ID
            const userId = typeof student === 'string' ? student : student.user;
            console.log('Viewing student with ID:', userId);
            setSelectedStudentId(userId);
            setShowModal(true);
        } catch (err) {
            console.error('Error setting student for viewing:', err);
            toast.error('Failed to view student details');
        }
    };
    
    // Function to filter sections based on strand and year level
    const filteredSections = useMemo(() => {
        return sections.filter(({ strand, yearLevel }) => {
            const matchesStrand = !selectedStrand || strand?.name === selectedStrand;
            const matchesYearLevel = !selectedYearLevel || yearLevel?.name === selectedYearLevel;
            return matchesStrand && matchesYearLevel;
        });
    }, [sections, selectedStrand, selectedYearLevel]);
    
    
    useEffect(() => {
        setAvailableSections(filteredSections);
    
        // Reset the selected section if it's no longer valid
        if (selectedSection && !filteredSections.some(section => section._id === selectedSection)) {
            setSelectedSection('');
        }
    }, [filteredSections, selectedSection]);
    
    const filteredStudents = useMemo(() => {
        if (!sections || sections.length === 0) {
            return [];
        }
        
        return sections.flatMap(({ students, name, strand, yearLevel, _id }) => {
            if (!students) {
                console.log(`No students in section ${name}`);
                return [];
            }
            
            const matchesFilters =
                (!selectedStrand || strand?.name === selectedStrand) &&
                (!selectedYearLevel || yearLevel?.name === selectedYearLevel) &&
                (!selectedSection || _id === selectedSection);
    
            if (!matchesFilters) return [];
    
            return (students || []).filter(student => 
                !showAdvisoryOnly || student.isAdvisory
            ).map(student => ({
                ...student,
                sectionName: name,
                strandName: strand?.name || 'Not Set',
                yearLevelName: yearLevel?.name || 'Not Set',
            }));
        });
    }, [sections, selectedStrand, selectedYearLevel, selectedSection, showAdvisoryOnly]);
    
    

    if (loading) return (
        <>
            <TeacherDashboardNavbar />
            <Container className="mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading section and student data...</p>
                </div>
            </Container>
        </>
    );

    if (error) return (
        <>
            <TeacherDashboardNavbar />
            <Container className="mt-4">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Error: {error}
                </div>
                <Card className="mt-3">
                    <Card.Header className="bg-light">
                        <h5 className="mb-0">API Connection Status</h5>
                    </Card.Header>
                    <Card.Body>
                        <HealthCheck />
                        <div className="mt-3">
                            <p className="mb-2"><strong>Troubleshooting Steps:</strong></p>
                            <ol className="ps-3">
                                <li>Verify your internet connection</li>
                                <li>Check if you're logged in properly (try logging out and back in)</li>
                                <li>Make sure the backend server is running</li>
                                <li>Clear your browser cache and cookies</li>
                                <li>Contact administrator if the problem persists</li>
                            </ol>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );

    const handleToggleAdvisoryView = (e) => {
        setShowAdvisoryOnly(e.target.checked); // Directly use the checkbox's value
        if (e.target.checked) {
            // Clear the selected filters when enabling advisory-only mode
            setSelectedStrand('');
            setSelectedYearLevel('');
            setSelectedSection('');
        }
    };
    
    

   return (
    <>
    <TeacherDashboardNavbar />
    <ToastContainer />
    <Container fluid className="px-4 py-3">
        {/* Header Section */}
        <Card className="mb-4 shadow-sm">
    <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h2 className="mb-0 fw-bold">My Students</h2>
                <small className="text-muted">
                Manage and view student information
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip>
                            <div>
                                <strong>Student Information Management</strong>
                                <ul className="list-unstyled mt-2">
                                    <li>✓ View comprehensive student profiles</li>
                                    <li>✓ Update personal and academic details</li>
                                </ul>
                            </div>
                        </Tooltip>
                    }
                >
                    
                        <i className="bi bi-info-circle me-2 ms-2"></i>
                        
                </OverlayTrigger>
                </small>
            </div>
            <div className="d-flex gap-2">
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip>
                            <strong>Total Students Enrolled</strong>
                            <p className="mb-0 mt-1">Current count of students you are handling</p>
                        </Tooltip>
                    }
                >
                    <Badge bg="primary" className="px-3 py-2">
                        Total Students: {filteredStudents.length}
                    </Badge>
                </OverlayTrigger>
                {showAdvisoryOnly && (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                <strong>Advisory Class View</strong>
                                <p className="mb-0 mt-1">Displaying students in your advisory class</p>
                            </Tooltip>
                        }
                    >
                        <Badge bg="success" className="px-3 py-2">
                            Advisory Class View
                        </Badge>
                    </OverlayTrigger>
                )}
            </div>
        </div>
        <div className="p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle text-warning me-3"></i>
            <p className="text-secondary mb-0">
            Complete student personal information for Form 137. Ensure all fields are accurately filled, 
    including full name, birthdate, address, and other essential demographic details. 
    Accurate and comprehensive information is crucial for official school records.
            </p>
            </div>
        </div>
    </Card.Body>
</Card>

        {/* Controls Section */}
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check 
                        type="switch"
                        id="advisory-switch"
                        label={<span className="fw-bold">Show Only Advisory Class</span>}
                        checked={showAdvisoryOnly}
                        onChange={handleToggleAdvisoryView}
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

                {/* Filters Section */}
                {!showAdvisoryOnly && (
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-funnel me-1"></i>
                                    Strand
                                </Form.Label>
                                <Form.Select 
                                    value={selectedStrand}
                                    onChange={(e) => setSelectedStrand(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Strands</option>
                                    {strands.map((strand, index) => (
                                        <option key={index} value={strand}>{strand}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-calendar me-1"></i>
                                    Year Level
                                </Form.Label>
                                <Form.Select
                                    value={selectedYearLevel}
                                    onChange={(e) => setSelectedYearLevel(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Year Levels</option>
                                    {yearLevels.map((yearLevel, index) => (
                                        <option key={index} value={yearLevel}>{yearLevel}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-people me-1"></i>
                                    Section
                                </Form.Label>
                                <Form.Select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Sections</option>
                                    {availableSections.map((section) => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                )}
            </Card.Body>
        </Card>

        {/* Students Table Section */}
        <TeacherStudentTable 
    filteredStudents={filteredStudents}
    showAdvisoryOnly={showAdvisoryOnly}
    handleViewStudent={handleViewStudent}
/>

        <UpdateStudentModal
            show={showModal}
            handleClose={() => {
                setShowModal(false);
            }}
            studentId={selectedStudentId}
            token={localStorage.getItem('token')}
        />
    </Container>
</>
    );
};

export default TeacherViewStudents;