import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';

interface Guest {
  id_tamu: number;
  waktu_tamu: string;
  nama_tamu: string;
  email_tamu: string;
  catatan_tamu: string;
}

function AdminGuestBook() {
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tamu');
      const data = response.data || [];
      setGuestList(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fail to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = async (id: number) => {
    setModalLoading(true);
    setShowModal(true);
    try {
      const response = await api.get(`/tamu/${id}`);
      setSelectedGuest(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fail to load detail');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete data?')) return;

    try {
      await api.delete(`/tamu/${id}`);
      setSuccess('Data deleted successfully');
      fetchGuests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to delete data');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGuest(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Guest Book</h3>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Time</th>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {guestList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    There is no guest yet.
                  </td>
                </tr>
              ) : (
                guestList.map((g) => (
                  <tr key={g.id_tamu}>
                    <td>{formatDate(g.waktu_tamu)}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => handleShowDetail(g.id_tamu)}
                      >
                        {g.nama_tamu}
                      </Button>
                    </td>
                    <td>{g.email_tamu}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(g.id_tamu)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalLoading ? 'Loading...' : selectedGuest?.nama_tamu}
          </Modal.Title>
          {selectedGuest && (
            <div className="text-muted fs-6">
              {selectedGuest.email_tamu}
            </div>
          )}
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : selectedGuest ? (
            <div>
              <p className="text-muted mb-3">
                {formatDate(selectedGuest.waktu_tamu)}
              </p>
              <div
                style={{ whiteSpace: 'pre-line' }}
                className="border rounded p-3 bg-light"
              >
                {selectedGuest.catatan_tamu}
              </div>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminGuestBook;