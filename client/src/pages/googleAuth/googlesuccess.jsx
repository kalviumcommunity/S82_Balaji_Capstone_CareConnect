import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/authcontext'; // adjust path if needed

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // use login function from context

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userLoggedIn", "true"); // <-- manually set this
      login(); // <-- call context login to update UI state
      alert("Google login successful!");
      navigate("/");
    } else {
      // alert("Google login failed.");
      // navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-medium">Logging you in with Google...</p>
    </div>
  );
};

export default GoogleSuccess;
