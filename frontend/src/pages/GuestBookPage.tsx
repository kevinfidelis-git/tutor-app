import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import AppNavbar from '../components/Navbar';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

function GuestBookPage() {
  const [guest, setGuest] = useState({ nama_tamu: '', email_tamu: '', catatan_tamu: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tamu`, guest);
      setMessage('Data input success.');
      setGuest({ nama_tamu: '', email_tamu: '', catatan_tamu: '' });
    } catch {
      setMessage('Sorry, an error occured in data input.');
    }
  };

  return (
    <>
      <AppNavbar />
      <div style={{ paddingTop: '70px' }}>
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8}>
              <h1 className="text-center">Guest Book</h1>
              <hr />
              {message && <div className="alert alert-info">{message}</div>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={guest.nama_tamu}
                    onChange={(e) => setGuest({...guest, nama_tamu: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={guest.email_tamu}
                    onChange={(e) => setGuest({...guest, email_tamu: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={guest.catatan_tamu}
                    onChange={(e) => setGuest({...guest, catatan_tamu: e.target.value})}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Send
                </Button>
              </Form>
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

export default GuestBookPage;