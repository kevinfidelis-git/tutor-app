import { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('tps') || '{}').token;
    
    // Fetch data
    axios.get(`${API_URL}/pengumuman?token=${token}`).then(r => setAnnouncements(r.data.slice(0, 5)));
    axios.get(`${API_URL}/kegiatan?token=${token}`).then(r => setSchedules(r.data.slice(0, 5)));
    // TODO: Fetch birthdays
  }, []);

  return (
    <div>
      <h1>Welcome, Administrator</h1>
      <hr />
      
      <Row>
        {/* Announcements */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Announcements</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a: any) => (
                    <tr key={a.id_pengumuman}>
                      <td>{new Date(a.tanggal_pengumuman).toLocaleDateString('id-ID')}</td>
                      <td>{a.judul_pengumuman}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Schedule */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Activities</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s: any) => (
                    <tr key={s.id_kegiatan}>
                      <td>{new Date(s.tanggal_kegiatan).toLocaleDateString('id-ID')}</td>
                      <td>{s.nama_kegiatan}</td>
                      <td>{s.tempat_kegiatan}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Birthdays */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>Tutor Assistants Who Have Birthdays This Month</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Group</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: Populate from API */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;