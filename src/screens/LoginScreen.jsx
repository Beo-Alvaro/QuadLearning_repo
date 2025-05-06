import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import apiConfig from '../config/apiConfig';
import './LoginScreen.css';

const LoginScreen = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const navigate = useNavigate();
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'TROPICALVNHS1234';
  
  // Clear any previous token on component mount
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  }, []);
  
  // ... rest of the code ...
} 