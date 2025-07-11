// SignupForm.jsx
import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";
import { useAuth } from './authcontext';

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient",
    specialization: "",
    experience: "",
    location: "",
    certificateFile: null,
    street: "",
    city: "",
    state: "",
    postalCode: "",
    agreed: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", form.userType);

      if (form.userType === "doctor") {
        formData.append("specialization", form.specialization);
        formData.append("experience", form.experience);
        formData.append("location", form.location);
        if (form.certificateFile) {
          formData.append("certificate", form.certificateFile);
        }
      }

      // Address fields
      formData.append("address[street]", form.street);
      formData.append("address[city]", form.city);
      formData.append("address[state]", form.state);
      formData.append("address[postalCode]", form.postalCode);

      const res = await axios.post("https://s82-balaji-capstone-careconnect-3.onrender.com/api/auth/signup", formData, 
 {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message);
      login();
      setTimeout(() => navigate("/login"), 100);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e6f9ff] p-2 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-xl overflow-hidden bg-white">
        <div className="hidden md:block md:w-1/2">
          <img src="https://sdk-image2.s3.ap-south-1.amazonaws.com/small_Sarvodaya_Building_New_Image_final_8d5554a560.jpg" alt="Sign Up" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h1 className="text-3xl font-semibold text-center mb-6">Sign Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userType" className="text-sm mb-1 block">I am a:</label>
              <select id="userType" name="userType" value={form.userType} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" required>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <div>
              <label htmlFor="fullName" className="text-sm mb-1 block">Full Name:</label>
              <div className="relative">
                <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter Full Name" className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9" />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm mb-1 block">Email ID:</label>
              <div className="relative">
                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email" className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9" />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm mb-1 block">Password:</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter Password" className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9" />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer" onClick={togglePassword} />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm mb-1 block">Confirm Password:</label>
              <div className="relative">
                <input id="confirmPassword" type={showPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Confirm Password" className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 pl-9" />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer" onClick={togglePassword} />
              </div>
            </div>

            {form.userType === "doctor" && (
              <>
                <div>
                  <label htmlFor="specialization" className="text-sm mb-1 block">Specialization:</label>
                  <select id="specialization" name="specialization" value={form.specialization} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- Select Specialization --</option>
                    <option value="dermatologist">Dermatologist</option>
                    <option value="cardiologist">Cardiologist</option>
                    <option value="neurologist">Neurologist</option>
                    <option value="orthopedic">Orthopedic</option>
                    <option value="gynecologist">Gynecologist</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="ent">ENT Specialist</option>
                    <option value="psychatrist">Psychiatrist</option>
                    <option value="pulmonologist">Pulmonologist</option>
                    <option value="general">General Physician</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="text-sm mb-1 block">Experience (in years):</label>
                  <input id="experience" name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="e.g. 5" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                <div>
                  <label htmlFor="location" className="text-sm mb-1 block">Location:</label>
                  <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="e.g. Chennai" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                <div>
                  <label htmlFor="certificateFile" className="text-sm mb-1 block">Certificate Upload:</label>
                  <input id="certificateFile" name="certificateFile" type="file" onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </>
            )}

            {/* Address Fields */}
            <div>
              <label htmlFor="street" className="text-sm mb-1 block">Street:</label>
              <input id="street" name="street" type="text" value={form.street} onChange={handleChange} placeholder="123 Main St" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="city" className="text-sm mb-1 block">City:</label>
              <input id="city" name="city" type="text" value={form.city} onChange={handleChange} placeholder="Chennai" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="state" className="text-sm mb-1 block">State:</label>
              <input id="state" name="state" type="text" value={form.state} onChange={handleChange} placeholder="Tamil Nadu" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="postalCode" className="text-sm mb-1 block">Postal Code:</label>
              <input id="postalCode" name="postalCode" type="text" value={form.postalCode} onChange={handleChange} placeholder="600001" required className="w-full px-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} required className="w-4 h-4" />
              <label className="text-xs">I agree to the terms and conditions</label>
            </div>

            <div className="space-y-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 text-sm rounded-full hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>

            <p className="text-center text-xs pt-2">
              Already have an account? 
              <Link to='/login'><a href="/login" className="text-blue-600 hover:underline">Login</a></Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
