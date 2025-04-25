import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Hero = () => {
  return (
    <div 
  className='hero-section py-5 d-flex align-items-center' 
  style={{ 
    minHeight: '100vh', 
    backgroundImage: 'url("/img/bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>

    <div className='hero-section py-5 d-flex align-items-center' >
    <Container>
      <Row className='justify-content-center'>
        <Col md={8} lg={6}>
          <Card className='p-5 text-center hero-card bg-white'>
            {/* School Logo could be added here */}
            <div className='d-flex justify-content-center mb-4'>
              <img 
                src="./img/TVNHS.png" 
                alt="School Logo" 
                style={{ width: '100px' }}
              />
            </div>
            
            <h1 className='mb-3 school-title'>
              Welcome to<br />
              <span className='highlight'>Tropical Village</span><br />
              National High School
            </h1>
  
            <p className='mb-4 welcome-text'>
              Empowering minds, building futures.<br />
              Your gateway to learning and excellence.
            </p>
  
            <div className='d-flex justify-content-center'>
              <LinkContainer to='/login'>
                <Button variant='success' size='lg' className='get-started-btn'>
                  Get Started
                </Button>
              </LinkContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
  </div>
  );
};

export default Hero;