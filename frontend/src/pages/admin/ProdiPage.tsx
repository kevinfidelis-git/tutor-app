import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface Prodi {
  id_prodi: number;
  program_studi: string;
}

function ProdiPage() {
  const { isLoading } = useAuth('admin');
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [programStudi, setProgramStudi] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProdi();
  }, []);

  const fetchProdi = async () => {
    try {
      const response = await api.get('/prodi');
      const data = response.data || [];
      setProdiList(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load the data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.post(`/prodi/${editingId}`, { program_studi: programStudi });
        setSuccess('Data updated successfully');
      } else {
        await api.post('/prodi', { program_studi: programStudi });
        setSuccess('Data added successfully');
      }
      setShowModal(false);
      setProgramStudi('');
      setEditingId(null);
      fetchProdi();
    } catch (err: any) {
      if (err.response?.status === 409) {
        window.alert('Major already exist');
      } else {
        window.alert(err.response?.data?.error || 'An error has occured');
      }
    }
  };

  const handleEdit = (item: Prodi) => {
    setEditingId(item.id_prodi);
    setProgramStudi(item.program_studi);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure to delete the data?')) return;
    
    try {
      await api.delete(`/prodi/${id}`);
      setSuccess('Data deleted successfully');
      fetchProdi();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Data deletion failed');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setProgramStudi('');
    setError('');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Major</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add major
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Major ID</th>
                <th>Major Name</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {prodiList.map((p) => (
                <tr key={p.id_prodi}>
                  <td>{p.id_prodi}</td>
                  <td>{p.program_studi}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-1" onClick={() => handleEdit(p)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id_prodi)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit' : 'Tambah'} Program Studi</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Major Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={programStudi}
                onChange={(e) => setProgramStudi(e.target.value)}
                required
                placeholder="Input the major name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="success" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ProdiPage;