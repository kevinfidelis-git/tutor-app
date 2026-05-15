import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  user: any;
}

export function useAuth(requiredRole?: string) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    role: null,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const tpsData = localStorage.getItem('tps');
      
      if (!tpsData) {
        setAuth({ isAuthenticated: false, isLoading: false, role: null, user: null });
        navigate('/');
        return;
      }

      try {
        const { token } = JSON.parse(tpsData);
        const response = await axios.get(`${API_URL}/login?token=${token}`);
        const role = response.data.role;

        // Check if required role matches
        if (requiredRole && role !== requiredRole) {
          // Redirect based on actual role
          if (role === 'admin') navigate('/admin');
          else if (role === 'astor') navigate('/astor');
          else if (role === 'maba') navigate('/maba');
          else navigate('/');
          return;
        }

        setAuth({
          isAuthenticated: true,
          isLoading: false,
          role,
          user: { token },
        });
      } catch (err) {
        localStorage.removeItem('tps');
        setAuth({ isAuthenticated: false, isLoading: false, role: null, user: null });
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  const logout = async () => {
    const tpsData = localStorage.getItem('tps');
    if (tpsData) {
      const { token } = JSON.parse(tpsData);
      try {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // Ignore logout errors
      }
    }
    localStorage.removeItem('tps');
    navigate('/');
  };

  return { ...auth, logout };
}