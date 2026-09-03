import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/authcontext';
import api from '../../utils/api';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const authenticateGoogle = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userLoggedIn', 'true');

      try {
        const res = await api.get('/api/profile/get-profile');
        const payload = res.data?.data || res.data;
        // The API returns the user object directly in 'data'
        const user = payload?.email ? payload : null;

        if (user) {
          login(token, user);
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };

    authenticateGoogle();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-medium">Logging you in with Google...</p>
    </div>
  );
};

export default GoogleSuccess;
