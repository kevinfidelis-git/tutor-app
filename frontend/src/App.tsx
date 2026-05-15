import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LandingPage from './pages/LandingPage';
import GuestBookPage from './pages/GuestBookPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ProdiPage from './pages/admin/ProdiPage';
import AdminGuestBook from './pages/admin/GuestBook';
import PengumumanPage from './pages/admin/Pengumuman';

// Placeholder dashboards
function InfoPage() { return <h2>Pengumuman</h2>; }
function JadwalPage() { return <h2>Jadwal Kegiatan</h2>; }
function MateriPage() { return <h2>Materi</h2>; }
function DataPage() { return <h2>Data</h2>; }
function PenilaianPage() { return <h2>Penilaian</h2>; }
function PeriodePage() { return <h2>Periode</h2>; }
function AstorDashboard() { return <h1>Astor Dashboard</h1>; }
function MabaDashboard() { return <h1>Maba Dashboard</h1>; }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/guestbook" element={<GuestBookPage />} />
        
        {/* Admin routes with sidebar layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="info" element={<PengumumanPage />} />
          <Route path="jadwal" element={<JadwalPage />} />
          <Route path="materi" element={<MateriPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="penilaian" element={<PenilaianPage />} />
          <Route path="periode" element={<PeriodePage />} />
          <Route path="prodi" element={<ProdiPage />} />
          <Route path="guestbook" element={<AdminGuestBook />} />
        </Route>
        
        {/* TODO: Astor and Maba routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;