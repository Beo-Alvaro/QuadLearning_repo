import { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import FormContainer from '../components/FormContainer';
import './LoginScreen.css';
const LoginScreen = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const response = await fetch('/api/users/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();

        // Debugging: Log data to verify the response structure
        console.log('Response data:', data);

        // Save the token and user info to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

      setLoading(false);
        // Navigate to dashboard based on role
    if (data.user.role === 'student') {
        navigate('./StudentScreens/StudentHomeScreen');
    } else if (data.user.role === 'teacher') {
        navigate('./TeacherScreens/TeacherHomeScreen');
    } else if (data.user.role === 'admin') {
        navigate('./AdminScreens/AdminHomeScreen');
    }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div 
    className='hero-section position-relative' 
    style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url("/img/bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  >
    <div className="position-absolute top-50 start-50 translate-middle w-100" style={{ maxWidth: '500px' }}>
      <Card className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <img 
              src="/img/TVNHS.png" 
              alt="School Logo" 
              style={{ width: '100px', marginBottom: '20px' }}
            />
            <h1 className="h3 mb-3 fw-bold text-success">
              TVNHS Access Portal
            </h1>
            <p className="text-muted">
              Secure login for administrators, teachers, and students
            </p>
          </div>

      {error && (
        <Alert variant="danger" className="text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='lrn'>
          <Form.Label className="fw-semibold">Username / LRN</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-person-fill"></i>
            </InputGroup.Text>
            <Form.Control
              type='text'
              placeholder='Enter Username / LRN'
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="border-start-0"
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className='mb-3' controlId='password'>
          <Form.Label className="fw-semibold">Password</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-lock-fill"></i>
            </InputGroup.Text>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-start-0"
              required
            />
          </InputGroup>
        </Form.Group>

        <Button 
          type='submit' 
          variant='success' 
          className='w-100 py-2 mt-3' 
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner 
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Loading...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </Form>
      </Card.Body>
    </Card>
  </div>
</div>
  );
};

export default LoginScreen;