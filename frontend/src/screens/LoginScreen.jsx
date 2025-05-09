import { useState, useEffect, useContext } from 'react';
import { Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './LoginScreen.css';
import { AuthContext } from '../context/authContext';
import { apiPost } from '../utils/api';

const LoginScreen = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        import.meta.env.VITE_ENCRYPTION_KEY || 'TROPICALVNHS12345'
      ).toString();
      
      const response = await apiPost('/api/users/auth', { 
        username, 
        password: encryptedPassword, 
        isEncrypted: true 
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid username or password');
      }

      const data = await response.json();
      
      // Store user data in context
      setUser(data);
      
      // Store JWT in localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Redirect based on user role
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'teacher') {
        navigate('/teacher');
      } else if (data.role === 'student') {
        navigate('/student');
      } else if (data.role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate(redirectUrl);
      }
      
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
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