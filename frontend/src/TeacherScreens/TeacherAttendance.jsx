import React, { useState, useEffect } from 'react'
import { Container, Button, Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap'
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar'
import TeacherAttendanceModal from '../TeacherComponents/TeacherAttendanceModal'
import { useTeacherUserContext } from '../context/teacherUserContext'
import axios from 'axios'

const TeacherAttendance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [localSections, setLocalSections] = useState([])
  const { sections, loading, error, fetchData } = useTeacherUserContext()

  // Helper function to get auth config
  const getAuthConfig = () => {
    // Try to get token from userInfo first
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    let token = userInfo.token;
    
    // If not found, try direct token
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    // Log token for debugging (only first few characters for security)
    if (token) {
      console.log('Token found:', token.substring(0, 10) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

  // Fetch sections directly in this component
  useEffect(() => {
    const fetchSectionsDirectly = async () => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        
        const config = getAuthConfig();
        
        // Check if we have a token
        if (!config.headers.Authorization) {
          setLocalError('No authentication token found. Please log in again.');
          setLocalLoading(false);
          return;
        }
        
        console.log('Making API request with headers:', config.headers);
        
        const response = await axios.get('/api/teacher/sections', config);
        
        console.log('API response:', response.data);
        
        if (Array.isArray(response.data)) {
          setLocalSections(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setLocalError('Received invalid data format from server');
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
        
        if (err.response) {
          console.log('Error response:', err.response.status, err.response.data);
          
          if (err.response.status === 401) {
            setLocalError('Your session has expired. Please log in again.');
          } else {
            setLocalError(`Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
          }
        } else {
          setLocalError(err.message || 'Failed to load sections');
        }
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchSectionsDirectly();
  }, []);

  const openModal = () => {
    if (!selectedSection) {
      alert('Please select a section first');
      return;
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <TeacherDashboardNavbar />
      <Container className="mt-4">
        <Card>
          <Card.Header as="h4">Attendance Management</Card.Header>
          <Card.Body>
            {localError && <Alert variant="danger">{localError}</Alert>}
            
            <p>Manage student attendance records using the SF2-SHS format.</p>
            
            {localLoading ? (
              <div className="text-center my-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading sections...</p>
              </div>
            ) : (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Section</Form.Label>
                      <Form.Select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={localLoading || localSections.length === 0}
                      >
                        <option value="">-- Select Section --</option>
                        {localSections.map((section) => (
                          <option key={section._id} value={section._id}>
                            {section.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button 
                  variant="primary" 
                  onClick={openModal}
                  disabled={!selectedSection || localLoading}
                >
                  Manage Attendance
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Connect the modal component */}
      <TeacherAttendanceModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        sectionId={selectedSection}
      />
    </div>
  );
};

export default TeacherAttendance;
