// src/pages/GoogleSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      alert("Google login successful!");
      navigate("/");
    } else {
      alert("Google login failed.");
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-medium">Logging you in with Google...</p>
    </div>
  );
};

export default GoogleSuccess;
