import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = () => {
  return (
    <div style={{ minHeight: '80vh' }} className="d-flex align-items-center justify-content-center">
      <div className="text-center">
        <Spinner 
          animation="border" 
          variant="dark" 
          style={{ 
            width: '4rem', 
            height: '4rem',
          }}
        />
        <p className="mt-3 text-dark fw-bold">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;