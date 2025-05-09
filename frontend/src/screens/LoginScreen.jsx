import { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './LoginScreen.css';
import { useAuth } from '../context/authContext';

const LoginScreen = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'TROPICALVNHS12345';
  const API_URL = import.meta.env.VITE_API_URL || '';
  const { login } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        ENCRYPTION_KEY
      ).toString();

      const response = await fetch(`${API_URL}/api/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: encryptedPassword, isEncrypted: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423) {
          throw new Error(data.message || 'Account is locked. Please try again later.');
        }
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Update auth context
      await login(data.token, data.user);

      // Navigate based on role
      const role = data.user.role;
      setLoading(false);
      
      switch(role) {
        case 'student':
          navigate('/student/home', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher/home', { replace: true });
          break;
        case 'admin':
          navigate('/admin/home', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }

    } catch (err) {
      setLoading(false);
      setError(err.message);
      
      if (err.message.includes('attempts remaining')) {
        setError(
          <div>
            <p>{err.message}</p>
            <small className="text-danger mb-5">
              Warning: Your account will be locked for 15 minutes after 5 failed attempts
            </small>
          </div>
        );
      }
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
            Your Gateway to Academic Success!
            </p>
          </div>

      {error && (
        <Alert variant="danger" className="text-center mb-4">
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
      type={showPassword ? 'text' : 'password'}
      placeholder='Enter password'
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border-start-0"
      required
    />
    <Button
      variant="outline-success"
      onClick={() => setShowPassword(!showPassword)}
      type="button"
    >
      <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
    </Button>
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