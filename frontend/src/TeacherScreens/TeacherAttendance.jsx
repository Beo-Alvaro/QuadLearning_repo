import React, { useState, useEffect } from 'react'
import { Container, Button, Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap'
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar'
import TeacherAttendanceModal from '../TeacherComponents/TeacherAttendanceModal'
import axios from 'axios'
import apiConfig from '../config/apiConfig'

const TeacherAttendance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advisorySection, setAdvisorySection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisorySection = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = apiConfig.getBaseUrl();
        
        const response = await axios.get(`${baseUrl}/teacher/advisorySections`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.advisorySection) {
          setAdvisorySection(response.data.advisorySection);
        } else {
          setError('No advisory section assigned.');
        }
      } catch (err) {
        console.error('Error fetching advisory section:', err);
        setError('You do not have an advisory section assigned.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisorySection();
  }, []);

  return (
    <div>
      <TeacherDashboardNavbar />
      <Container className="mt-4">
        <Card>
          <Card.Header as="h4">Attendance Management</Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
                <p>Loading advisory section...</p>
              </div>
            ) : error ? (
              <Alert variant="warning">
                {error}
                <p className="mb-0 mt-2">
                  Only teachers with advisory sections can manage attendance.
                </p>
              </Alert>
            ) : advisorySection ? (
              <>
                <Row className="mb-3">
                  <Col>
                    <Alert variant="info">
                      <strong>Your Advisory Section:</strong> {advisorySection.name}
                      <br />
                      <small>
                        {advisorySection.yearLevel} - {advisorySection.strand}
                      </small>
                    </Alert>
                  </Col>
                </Row>
                <Button 
                  variant="primary" 
                  onClick={() => setIsModalOpen(true)}
                >
                  Manage Attendance
                </Button>
                <TeacherAttendanceModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  sectionId={advisorySection._id}
                />
              </>
            ) : null}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TeacherAttendance;