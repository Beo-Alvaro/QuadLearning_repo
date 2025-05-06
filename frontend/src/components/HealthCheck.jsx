import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import apiConfig from '../config/apiConfig';

const HealthCheck = () => {
    const [status, setStatus] = useState({ loading: true, healthy: false, message: '' });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const baseUrl = apiConfig.getBaseUrl();
                console.log('Checking API health at:', `${baseUrl}/health`);
                
                const response = await fetch(`${baseUrl}/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStatus({
                        loading: false,
                        healthy: true,
                        message: `API is healthy. Environment: ${data.environment}, Timestamp: ${new Date(data.timestamp).toLocaleTimeString()}`
                    });
                } else {
                    setStatus({
                        loading: false,
                        healthy: false,
                        message: `API responded with status ${response.status}`
                    });
                }
            } catch (error) {
                console.error('Health check failed:', error);
                setStatus({
                    loading: false,
                    healthy: false,
                    message: `Failed to connect to API: ${error.message}`
                });
            }
        };

        checkHealth();
    }, []);

    if (status.loading) {
        return (
            <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Checking API connection...
            </Alert>
        );
    }

    return (
        <Alert variant={status.healthy ? "success" : "danger"}>
            <i className={`bi ${status.healthy ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
            {status.healthy ? 'Connection to API server established.' : `API connection issue: ${status.message}`}
        </Alert>
    );
};

export default HealthCheck; 