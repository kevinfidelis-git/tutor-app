import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

function LandingPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Step 1: Login → get JWT token
      const loginRes = await axios.post(`${API_URL}/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      const token = loginRes.data.token;

      // Step 2: Store token (with expiry)
      const hours = 6;
      const expiry = Date.now() + (hours * 60 * 60 * 1000);
      localStorage.setItem('tps', JSON.stringify({ token, expiry }));

      // Step 3: Check role
      const roleRes = await axios.get(`${API_URL}/login?token=${token}`);
      const role = roleRes.data.role;

      // Step 4: Redirect based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'astor') navigate('/astor');
      else if (role === 'maba') navigate('/maba');
      else setError('No student data found in the database!');
      
    } catch (err: any) {
      if (err.response) {
        const goError = err.response.data?.error || 'Error has occured.';
        setError(goError);
      } else if (err.request) {
        setError('Can\'t connect to server. Please check your connection.');
      } else {
        setError('Error has occured. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <div style={{ paddingTop: '70px' }}>
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} className="text-center mb-5">
              <h1>Welcome</h1>
              <hr />
              <p className="lead">
                Tutor Assistant Information System<br />
                Petra Christian University
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col md={5}>
              <Card>
                <Card.Body>
                  <h4 className="text-center mb-4">Login</h4>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Login'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        
        <footer className="mt-5 py-4 text-center bg-dark text-white">
          <Container>
            &copy; 2026 | Kevin Fidelis<br />
          </Container>
        </footer>
      </div>
    </>
  );
}

export default LandingPage;