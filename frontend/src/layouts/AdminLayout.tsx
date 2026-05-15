import { useState } from 'react';
import { Navbar, Nav, Offcanvas, Button } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminLayout() {
  const { isLoading, logout } = useAuth('admin');
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Home', icon: '📊' },
    { path: '/admin/info', label: 'Announcements', icon: '📢' },
    { path: '/admin/jadwal', label: 'Activities', icon: '📅' },
    { path: '/admin/materi', label: 'Materials and Meetings', icon: '📚' },
    { path: '/admin/penilaian', label: 'Evaluation Criteria', icon: '📝' },
    { path: '/admin/periode', label: 'Period', icon: '📆' },
    { path: '/admin/data', label: 'Tutor Assistants and New Students Data', icon: '👥' },
    { path: '/admin/guestbook', label: 'Guestbook', icon: '📖' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Desktop Sidebar - Fixed */}
      <div 
        className="d-none d-md-flex flex-column text-white" 
        style={{ 
          backgroundColor: '#2b5797',
          width: '260px', 
          minHeight: '100vh', 
          position: 'fixed', 
          left: 0, 
          top: 0,
          zIndex: 1000
        }}
      >
        <div className="p-3 border-bottom border-secondary">
          <h5 className="mb-0">Tim Petra Sinergi</h5>
          <small className="text-white">Administrator</small>
        </div>
        
        <Nav className="flex-column flex-grow-1 p-2" style={{ overflowY: 'auto' }}>
          {navItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`rounded mb-1 ${isActive(item.path) ? 'active bg-dark text-white' : 'text-white'}`}
              style={isActive(item.path) ? {} : { opacity: 0.8 }}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
        
        <div className="p-3 border-top border-secondary">
          <Button variant="outline-light" size="sm" className="w-100" onClick={logout}>
            🚪 Logout
          </Button>
        </div>
      </div>

      {/* Mobile Top Navbar */}
      <Navbar variant="dark" className="d-md-none w-100" style={{ position: 'fixed', top: 0, zIndex: 1000, backgroundColor: '#2b5797' }}>
        <div className="container-fluid">
          <Navbar.Brand className="fs-6">Tim Petra Sinergi</Navbar.Brand>
          <Button variant="outline-light" size="sm" onClick={() => setShowSidebar(true)}>
            ☰ Menu
          </Button>
        </div>
      </Navbar>

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="text-white" style={{ backgroundColor: '#2b5797' }}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>Tim Petra Sinergi</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                onClick={() => setShowSidebar(false)}
                className={`rounded mb-1 ${isActive(item.path) ? 'active bg-primary text-white' : 'text-white'}`}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <Button variant="outline-light" className="w-100 mt-3" onClick={logout}>
            🚪 Logout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content - Pushed right on desktop */}
      <div 
        className="flex-grow-1" 
        style={{ 
          marginLeft: '0',
          padding: '1rem',
          minHeight: '100vh'
        }}
      >
        {/* Desktop: Add margin for sidebar */}
        <div className="d-none d-md-block" style={{ marginLeft: '260px' }}>
          <Outlet />
        </div>
        {/* Mobile: Add top padding for navbar */}
        <div className="d-md-none" style={{ paddingTop: '56px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;