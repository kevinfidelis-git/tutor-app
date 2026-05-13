import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './pages/LandingPage';
import GuestBookPage from './pages/GuestBookPage';

// Placeholder dashboards
function AdminDashboard() { return <h1>Admin Dashboard</h1>; }
function AstorDashboard() { return <h1>Astor Dashboard</h1>; }
function MabaDashboard() { return <h1>Maba Dashboard</h1>; }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/guestbook" element={<GuestBookPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/astor" element={<AstorDashboard />} />
        <Route path="/maba" element={<MabaDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;