import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useAuth } from './authcontext';
import Logo from '../../assets/FullLogo.jpg'; // Assuming you have a logo image

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

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

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
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

      formData.append("address[street]", form.street);
      formData.append("address[city]", form.city);
      formData.append("address[state]", form.state);
      formData.append("address[postalCode]", form.postalCode);

      if (form.userType === "doctor") {
        formData.append("specialization", form.specialization);
        formData.append("experience", form.experience);
        formData.append("location", form.location);
        if (form.certificateFile) {
          formData.append("certificate", form.certificateFile);
        }
      }

      const res = await axios.post(
        `${API_BASE}/api/auth/signup`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (res.data.verificationRequired) {
        setShowOtp(true);
        alert(res.data.message);
      } else {
        alert(res.data.message || "Registration successful! Please wait for admin approval (Doctors) or login (Patients).");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Signup failed. Try again.");
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/user/verify`, {
        email: form.email,
        otp: otp,
      });
      alert(res.data.message || "Account verified successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed. Please check your OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#e6f9ff] flex justify-center items-center relative px-4 py-6">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center text-blue-700 font-semibold hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-100 p-6">
  <div className="text-center">
    <img
      src={Logo}
      alt="Welcome"
      className="w-64 h-auto mx-auto mb-6 rounded-xl shadow-lg"
    />
    <h2 className="text-xl font-semibold text-blue-800">Welcome to CareConnect</h2>
    <p className="text-sm text-gray-600">Your health, our priority.</p>
  </div>
</div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Create Account</h2>

          {showOtp ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-blue-700">Verify Your Email</h3>
              <p className="text-xs text-center text-gray-600">Enter the 6-digit code sent to {form.email}</p>
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border text-center text-xl tracking-widest"
                  maxLength="6"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isVerifying}
                  className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isVerifying ? "Verifying..." : "Verify Account"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="w-full text-blue-600 text-xs hover:underline"
                >
                  Edit details / Back to Signup
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Role */}
              <div>
                <label className="block mb-1 font-medium">I am a:</label>
                <select
                  name="userType"
                  value={form.userType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full border border-gray-300"
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
              </div>

              {form.userType === "doctor" && (
                <>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-full border text-gray-600"
                  >
                    <option value="">Select Specialization</option>
                    <option value="general">General Physician</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="ent">ENT</option>
                    <option value="gynecology">Gynecology</option>
                  </select>

                  <input
                    type="number"
                    name="experience"
                    placeholder="Experience (in years)"
                    value={form.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-full border"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Clinic Location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-full border"
                  />
                  <input
                    type="file"
                    name="certificateFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-full border"
                  />
                </>
              )}


              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" name="street" placeholder="Street" value={form.street} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
                <input type="text" name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} required className="px-4 py-2 rounded-full border" />
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} required />
                <label className="text-xs text-gray-600">I agree to the terms and conditions.</label>
              </div>

              <button type="submit"   className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700">Sign Up</button>

              <p className="text-center text-xs text-gray-600 mt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
