import { useState, useEffect } from 'react';
import StudentDashboardNavbar from '../StudentComponents/StudentDashboardNavbar';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FaUser, FaGraduationCap, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const StudentProfile = () => {
    const [studentData, setStudentData] = useState({
        firstName: '',
        lastName: '',
        middleInitial: '',
        gender: '',
        birthdate: '',
        contactNumber: '',
        birthplace: {
            province: '',
            municipality: '',
            barrio: ''
        },
        address: '',
        guardian: {
            name: '',
            occupation: ''
        },
        yearLevel: '',
        section: '',
        strand: '',
        school: {
            name: 'Tropical Village National Highschool',
            year: ''
        }
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching with token:', token); // Debug log

                const response = await fetch('/api/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status); // Debug log

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Received data:', result); // Debug log

                if (result.success) {
                    setStudentData(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching student profile:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, []);

    return ( 
        <>
        <StudentDashboardNavbar />
        <Container className="py-5">
                <div className="mb-5 text-center">
                    <h1 className="display-6 fw-bold text-dark mb-3">
                        Student Profile
                        <div 
                            className="mx-auto mt-2 bg-secondary rounded" 
                            style={{height: '2px', width: '150px'}}
                        ></div>
                    </h1>
                    <p className="text-muted lead">Comprehensive Student Information</p>
                </div>
    
                <Row className="g-4">
                    {/* Personal Information */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-success text-white d-flex align-items-center p-3">
                                <div 
                                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center me-3 shadow-sm"
                                    style={{width: '50px', height: '50px'}}
                                >
                                    <FaUser className="fs-4" />
                                </div>
                                <div>
                                    <h4 className="mb-0">Personal Information</h4>
                                    <small className="text-white">Basic personal details</small>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
                                    {[
                                        { label: 'Full Name', value: `${studentData.firstName} ${studentData.middleInitial} ${studentData.lastName}` },
                                        { label: 'Gender', value: studentData.gender },
                                        { label: 'Birthdate', value: studentData.birthdate ? new Date(studentData.birthdate).toLocaleDateString() : 'N/A' },
                                        { label: 'Contact Number', value: studentData.contactNumber },
                                    ].map((item, index) => (
                                        <Col md={6} key={index}>
                                            <div className="bg-light rounded-3 p-3 h-100">
                                                <small className="text-muted d-block mb-2">{item.label}</small>
                                                <h6 className="mb-0 text-dark">{item.value}</h6>
                                            </div>
                                        </Col>
                                    ))}
                                    <Col md={12}>
                                        <div className="bg-light rounded-3 p-3">
                                            <small className="text-muted d-block mb-2">Address</small>
                                            <h6 className="mb-0 text-dark">{studentData.address}</h6>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
    
                    {/* Academic Information */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-success text-white d-flex align-items-center p-3">
                                <div 
                                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center me-3 shadow-sm"
                                    style={{width: '50px', height: '50px'}}
                                >
                                    <FaGraduationCap className="fs-4" />
                                </div>
                                <div>
                                    <h4 className="mb-0">Academic Information</h4>
                                    <small className="text-white">Educational details</small>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
                                    {[
                                        { label: 'Year Level', value: studentData.yearLevel },
                                        { label: 'Section', value: studentData.section },
                                        { label: 'Strand', value: studentData.strand },
                                        { label: 'School', value: studentData.school.name },
                                    ].map((item, index) => (
                                        <Col md={6} key={index}>
                                            <div className="bg-light rounded-3 p-3 h-100">
                                                <small className="text-muted d-block mb-2">{item.label}</small>
                                                <h6 className="mb-0 text-dark">{item.value}</h6>
                                            </div>
                                        </Col>
                                    ))}
                                    <Col md={12}>
                                        <div className="bg-light rounded-3 p-3">
                                            <small className="text-muted d-block mb-2">School Year</small>
                                            <h6 className="mb-0 text-dark">{studentData.school.year}</h6>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
    
                    {/* Guardian Information */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-success text-white d-flex align-items-center p-3">
                                <div 
                                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center me-3 shadow-sm"
                                    style={{width: '50px', height: '50px'}}
                                >
                                    <FaPhone className="fs-4" />
                                </div>
                                <div>
                                    <h4 className="mb-0">Guardian Information</h4>
                                    <small className="text-white">Contact details</small>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
                                    <Col md={6}>
                                        <div className="bg-light rounded-3 p-3 h-100">
                                            <small className="text-muted d-block mb-2">Guardian Name</small>
                                            <h6 className="mb-0 text-dark">{studentData.guardian?.name || 'N/A'}</h6>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="bg-light rounded-3 p-3 h-100">
                                            <small className="text-muted d-block mb-2">Guardian Occupation</small>
                                            <h6 className="mb-0 text-dark">{studentData.guardian.occupation}</h6>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
    
                    {/* Birthplace Information */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-success text-white d-flex align-items-center p-3">
                                <div 
                                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center me-3 shadow-sm"
                                    style={{width: '50px', height: '50px'}}
                                >
                                    <FaMapMarkerAlt className="fs-4" />
                                </div>
                                <div>
                                    <h4 className="mb-0">Birthplace Information</h4>
                                    <small className="text-white">Origin details</small>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
            {[
                { label: 'Province', value: studentData.birthplace.province },
                { label: 'Municipality', value: studentData.birthplace.municipality },
                { label: 'Barrio', value: studentData.birthplace.barrio },
            ].map((item, index) => (
                <Col md={4} key={index}>
                    <div className="bg-light rounded-3 p-3 h-100 text-center">
                        <small className="text-muted d-block mb-2">{item.label}</small>
                        <h6 className="mb-0 text-dark">{item.value}</h6>
                    </div>
                </Col>
            ))}
        </Row>
    </Card.Body>
    </Card>
    </Col>
    </Row>
    </Container>
    </>
    );
}
 
export default StudentProfile;