import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";
import GoogleSignInButton from "../googleAuth/googlesigninbutton";
import {useAuth} from './authcontext'
const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const { login } = useAuth();
  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://s82-balaji-capstone-careconnect-4.onrender.com/api/auth/login", form);
       if (res.data?.user) {
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  login();
  alert(`Welcome ${res.data.user.fullName}`);
  navigate("/");
}

       else {
        alert("Login successful");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e6f9ff] p-2 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-xl overflow-hidden bg-white">

        {/* Left Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm mb-1 block">Email ID:</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter Email"
                  className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm mb-1 block">Password:</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9"
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer"
                  onClick={togglePassword}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="text-sm mb-1 block">Select Role:</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            
            {/* Submit */}
            <div className="space-y-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 text-sm rounded-full hover:bg-blue-700 transition-colors">
                Login
              </button>
            </div>

            {/* Google Sign In */}
            <div className="space-y-2 pt-1">
              <button
    type="button"
    onClick={() => window.location.href = "http://s82-balaji-capstone-careconnect-4.onrender.com/api/auth/google"}
    className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 text-sm rounded-full hover:bg-red-600 transition-colors"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
      alt="Google Logo"
      className="w-5 h-5"
    />
    Continue with Google
  </button>
</div>

            {/* Sign Up */}
            <p className="text-center text-xs pt-2">
              Don&apos;t have an account?{" "}
              <Link to='/signup'>
              <a href="/signup" className="text-blue-600 hover:underline">Signup</a>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
