import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './pages/LandingPage';
import GuestBookPage from './pages/GuestBookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/guestbook" element={<GuestBookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;