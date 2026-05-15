import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';

interface Pengumuman {
  id_pengumuman: number;
  judul_pengumuman: string;
  isi_pengumuman: string;
  tanggal_pengumuman: string;
  tanggal_expire: string;
}

function PengumumanPage() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Pengumuman | null>(null);

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggalExpire, setTanggalExpire] = useState<Date | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [showAll]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = showAll ? '/pengumuman/all' : '/pengumuman';
      const response = await api.get(url);
      setList(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tanggalExpire) {
      setError('Expired date must be filled');
      return;
    }

    try {
      const payload = {
        judul_pengumuman: judul,
        isi_pengumuman: isi,
        tanggal_expire: tanggalExpire.toISOString().split('T')[0],
      };

      if (editingId) {
        await api.put(`/pengumuman/${editingId}`, payload);
        setSuccess('Data updated successfully');
      } else {
        await api.post('/pengumuman', payload);
        setSuccess('Data added successfully');
      }
      handleClose();
      fetchData();
    } catch (err: any) {
      window.alert(err.response?.data?.error || 'An error has occured');
    }
  };

  const handleEdit = (item: Pengumuman) => {
    setEditingId(item.id_pengumuman);
    setJudul(item.judul_pengumuman);
    setIsi(item.isi_pengumuman);
    setTanggalExpire(new Date(item.tanggal_expire));
    setShowModal(true);
  };

  const handleDuplicate = (item: Pengumuman) => {
    setEditingId(null);
    setJudul(item.judul_pengumuman);
    setIsi(item.isi_pengumuman);
    setTanggalExpire(new Date(item.tanggal_expire));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure want to delete data?')) return;
    try {
      await api.delete(`/pengumuman/${id}`);
      setSuccess('Data deleted successfully');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to delete data');
    }
  };

  const handleShowDetail = (item: Pengumuman) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setJudul('');
    setIsi('');
    setTanggalExpire(null);
    setError('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Pengumuman</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add announcement
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th className="d-none d-md-table-cell">Content</th>
                <th style={{ width: '150px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    There is no announcement data yet
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id_pengumuman}>
                    <td>{formatDate(p.tanggal_pengumuman)}</td>
                    <td>
                      <Button variant="link" className="p-0 text-decoration-none" onClick={() => handleShowDetail(p)}>
                        {p.judul_pengumuman}
                      </Button>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {p.isi_pengumuman.length > 50 ? p.isi_pengumuman.substring(0, 50) + '...' : p.isi_pengumuman}
                    </td>
                    <td>
                      <Button variant="warning" size="sm" className="me-1" onClick={() => handleEdit(p)}>
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button variant="primary" size="sm" className="me-1" onClick={() => handleDuplicate(p)}>
                        <i className="bi bi-clipboard-plus-fill"></i>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(p.id_pengumuman)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {!showAll && (
            <Button variant="outline-secondary" size="sm" onClick={() => setShowAll(true)}>
              Show all announcements
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit' : 'Add'} Announcement</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                placeholder="Enter the title of the announcement"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                required
                placeholder="Enter the content of the announcement"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Shown Until <span className="text-danger">*</span></Form.Label>
              <div>
                <DatePicker
                  selected={tanggalExpire}
                  onChange={(date) => setTanggalExpire(date)}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  placeholderText="Select date"
                  required
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="success" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedItem?.judul_pengumuman}</Modal.Title>
          <div className="text-muted fs-6 ms-2">
            {selectedItem && formatDate(selectedItem.tanggal_pengumuman)}
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <div
                style={{ whiteSpace: 'pre-line' }}
                className="p-2"
                dangerouslySetInnerHTML={{ __html: selectedItem.isi_pengumuman }}
              />
              <hr />
              <p className="text-muted">
                Shown until: {formatDate(selectedItem.tanggal_expire)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PengumumanPage;