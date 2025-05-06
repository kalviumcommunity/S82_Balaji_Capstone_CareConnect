import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient", // frontend uses this name
    specialization: "",
    experience: "",
    location: "",
    certificateUrl: "",
    agreed: false,
  });

  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.userType, // ✅ Backend expects this as `role`
        ...(form.userType === "doctor" && {
          specialization: form.specialization,
          experience: form.experience,
          location: form.location,
          certificateUrl: form.certificateUrl,
        }),
      });

      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e6f9ff] p-2 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-xl overflow-hidden bg-white">
        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1543363136-59b7b660aa94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Sign Up"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Signup Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h1 className="text-3xl font-semibold text-center mb-6">Sign Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* User Type */}
            <div>
              <label htmlFor="userType" className="text-sm mb-1 block">I am a:</label>
              <select
                id="userType"
                name="userType"
                value={form.userType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="text-sm mb-1 block">Full Name:</label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter Full Name"
                  className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

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
                  required
                  placeholder="Enter Password"
                  className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer" onClick={togglePassword} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm mb-1 block">Confirm Password:</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer" onClick={togglePassword} />
              </div>
            </div>

            {/* Doctor Extra Fields */}
            {form.userType === "doctor" && (
              <>
                <div>
                  <label htmlFor="specialization" className="text-sm mb-1 block">Specialization:</label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Dermatologist"
                    required
                    className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="text-sm mb-1 block">Experience (in years):</label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    required
                    className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="text-sm mb-1 block">Location:</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Chennai"
                    required
                    className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label htmlFor="certificateUrl" className="text-sm mb-1 block">Certificate URL:</label>
                  <input
                    id="certificateUrl"
                    name="certificateUrl"
                    type="url"
                    value={form.certificateUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://certificate.com"
                    required
                    className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </>
            )}

            {/* Agree to Terms */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="agreed"
                checked={form.agreed}
                onChange={handleChange}
                required
                className="w-4 h-4"
              />
              <label className="text-xs">I agree to the terms and conditions</label>
            </div>

            {/* Submit Button */}
            <div className="space-y-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 text-sm rounded-full hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>

            {/* Already have account */}
            <p className="text-center text-xs pt-2">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
