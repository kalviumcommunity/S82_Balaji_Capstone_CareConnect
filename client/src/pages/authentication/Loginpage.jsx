import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ChevronLeft } from "lucide-react";
import axios from "axios";
import { useAuth } from "./authcontext";
import Logo from "../../assets/FullLogo.jpg"; // Your logo path
import {jwtDecode} from "jwt-decode";


const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form, { withCredentials: true }
      );

      if (res.data?.user) {
  const rawUser = res.data.user;
  const token = res.data.token;
      const decoded = jwtDecode(token);
  const user = {
  ...rawUser,
  role: decoded.role || "patient",
};


  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(user));
  login(); // from context?
  alert(`Welcome ${user.fullName}`);
console.log("Logged in user:", user.role);
console.log("Login API response:", res.data);


  if (user.role === "doctor") {
  navigate("/doctor/dashboard");
} else {
  navigate("/");
}
} else {
  alert("Login failed.");
}

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e6f9ff] p-4">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center text-blue-700 font-semibold hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl bg-white rounded-xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-100 p-6">
          <div className="text-center">
            <img
              src={Logo}
              alt="Welcome"
              className="w-64 h-auto mx-auto mb-6 rounded-xl shadow-lg"
            />
            <h2 className="text-xl font-semibold text-blue-800">
              Welcome Back to CareConnect
            </h2>
            <p className="text-sm text-gray-600">Login to access your dashboard.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm mb-1 block">
                Email ID:
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter Email"
                  className="w-full px-4 py-2 text-sm rounded-full border pl-9 focus:ring-2 focus:ring-blue-400"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm mb-1 block">
                Password:
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-2 text-sm rounded-full border pl-9 focus:ring-2 focus:ring-blue-400"
                />
                <Lock
                  onClick={togglePassword}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="text-sm mb-1 block">
                Select Role:
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm rounded-full border focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 text-sm rounded-full hover:bg-blue-700 transition-colors"
            >
              Login
            </button>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "https://s82-balaji-capstone-careconnect-4.onrender.com/api/auth/google")
              }
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 text-sm rounded-full hover:bg-red-600 transition-colors"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google Logo"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Signup Link */}
            <p className="text-center text-xs pt-2">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Signup
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
