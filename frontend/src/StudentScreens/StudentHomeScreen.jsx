import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { FaUser, FaChartBar } from 'react-icons/fa';
import StudentDashboardNavbar from '../StudentComponents/StudentDashboardNavbar';

const StudentHomeScreen = () => {
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
        },
        grades: {
            subjects: [{
                name: '',
                code: '',
                semester: {
                    name: ''
                }
            }],
            semester: ''
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return ( 
        <>
        <StudentDashboardNavbar />
        <Container className="mt-4">
            <Row>
                {/* Welcome Card */}
                <Col md={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Card.Title>
                                <h2>Welcome, {studentData.firstName} {studentData.lastName}!</h2>
                            </Card.Title>
                            <Card.Text>
                                You are currently enrolled in {studentData.yearLevel} {studentData.strand} 
                                . Stay focused, keep learning, and make the most of your academic journey.
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    {/* Subjects Card */}
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h4>Current Semester Subjects</h4>
                        </Card.Header>
                        <Card.Body>
                        {studentData.grades.subjects.length > 0 ? (
                            studentData.grades.subjects.map((subject, index) => (
                                <div key={index} className="mb-3 p-2 border-bottom">
                                    <h5>{subject.name}</h5>
                                    <p>
                <strong>Code:</strong> {subject.code} | 
                <strong>Section:</strong> {subject.section && subject.section.name 
                    ? subject.section.name 
                    : studentData.section || 'N/A'} - <span> </span>
                {subject.yearLevel && subject.yearLevel.name 
                    ? subject.yearLevel.name 
                    : studentData.yearLevel || 'N/A'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No subjects found for this semester.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Actions Card */}
                <Col md={4}>
                    <Card className="shadow-sm h-100">
                        <Card.Header>
                            <h4>Quick Actions</h4>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Row className="g-3">
                                <Col xs={12}>
                                    <Link 
                                        to="/login/StudentScreens/StudentProfile" 
                                        className="text-decoration-none"
                                    >
                                        <Card 
    className="quick-action-card h-100 d-flex align-items-center justify-content-center text-center p-3 border-warning"
    style={{
        backgroundColor: '#f7f3e0', // Soft, muted yellow background
        borderRadius: '10px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
    onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    }}
    onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
    }}
>
    <div>
        <FaUser 
            size={50} 
            className="text-warning mb-3" 
        />
        <h5 className="text-dark">View Profile</h5>
        <p className="text-muted small">
            View and manage your personal information
        </p>
    </div>
</Card>
                                    </Link>
                                </Col>
                                <Col xs={12}>
                                    <Link 
                                        to="/login/StudentScreens/StudentViewGrades" 
                                        className="text-decoration-none"
                                    >
                                        <Card 
                                            className="quick-action-card h-100 d-flex align-items-center justify-content-center text-center p-3 border-success"
                                            style={{
                                                backgroundColor: '#f0fff4',
                                                borderRadius: '10px',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <div>
                                                <FaChartBar 
                                                    size={50} 
                                                    className="text-success mb-3" 
                                                />
                                                <h5 className="text-success">View Grades</h5>
                                                <p className="text-muted small">
                                                    Check your academic performance
                                                </p>
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                                <Col xs={12}>
                                    <Link 
                                        to="/login/StudentScreens/StudentMessages" 
                                        className="text-decoration-none"
                                    >
                                        <Card 
                                            className="quick-action-card h-100 d-flex align-items-center justify-content-center text-center p-3 border-success"
                                            style={{
                                                backgroundColor: '#f0fff4',
                                                borderRadius: '10px',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <div>
                                                <FaChartBar 
                                                    size={50} 
                                                    className="text-success mb-3" 
                                                />
                                                <h5 className="text-success">Send a Message</h5>
                                                <p className="text-muted small">
                                                    Tell your concerns to the admin
                                                </p>
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </>
     );
}
 
export default StudentHomeScreen;