import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToHome = () => {
    if (!user) {
      navigate('/');
      return;
    }

    switch (user.role) {
      case 'student':
        navigate('/student/home');
        break;
      case 'teacher':
        navigate('/teacher/home');
        break;
      case 'admin':
        navigate('/admin/home');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Container>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={6} className="text-center">
          <img 
            src="/img/404.png" 
            alt="Page Not Found" 
            style={{ maxWidth: '300px', marginBottom: '2rem' }}
          />
          <h1 className="text-success mb-4">Page Not Found</h1>
          <p className="lead mb-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button 
            variant="success" 
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;