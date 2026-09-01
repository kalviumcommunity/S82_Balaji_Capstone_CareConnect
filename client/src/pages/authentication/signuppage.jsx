import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Mail, Lock, User, Building, MapPin, FileText, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import api from '../../utils/api';
import axios from 'axios';
import { useAuth } from './authcontext';
import Logo from '../../assets/FullLogo.jpg';

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
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '' });
  const togglePassword = () => setShowPassword(!showPassword);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

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
      showToast("Passwords do not match!");
      return;
    }

    setIsLoading(true);
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
        showToast(res.data.message, 'success');
      } else {
        showToast(res.data.message || "Registration successful!", 'success');
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.response?.data?.error || "Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.post('/api/auth/user/verify', {
        email: form.email,
        otp: otp,
      });
      showToast(res.data.message || "Account verified successfully!", 'success');
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed. Please check your OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center relative px-4 py-8 overflow-hidden">
      {/* Decorative ambient background lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-600 font-medium rounded-xl shadow-sm border border-slate-200/80 transition-all duration-200 group z-10"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </Link>

      {/* Toast notification */}
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
            : 'bg-rose-500 text-white shadow-rose-500/20'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden z-10">
        
        {/* Left Panel */}
        <div className="hidden md:flex md:w-5/12 items-center justify-center bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-100/60 p-10 border-r border-slate-100">
          <div className="text-center max-w-sm">
            <div className="relative inline-block mb-6">
              <img
                src={Logo}
                alt="Welcome"
                className="w-48 h-auto mx-auto rounded-2xl shadow-xl border-4 border-white object-cover"
              />
              <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Welcome to CareConnect</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your health, our top priority. Connect with top-tier medical specialists securely.</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 overflow-y-auto max-h-[88vh]">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 mt-1">Fill in your details to get started with CareConnect</p>
          </div>

          {showOtp ? (
            <div className="space-y-6 py-4">
              <div className="bg-blue-50/60 border border-blue-100 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Verify Your Email</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the 6-digit verification code sent to <span className="font-semibold text-slate-700">{form.email}</span></p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-5">
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner"
                  maxLength="6"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Verify Account"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="w-full text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  ← Edit details / Back to Signup
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">I am registering as a:</label>
                <div className="relative">
                  <select
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all shadow-inner font-medium"
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    name="fullName" 
                    placeholder="Full Name" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" 
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                </div>

                <div className="relative">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" 
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 pr-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                </div>
              </div>

              {/* Doctor Specific Fields */}
              {form.userType === "doctor" && (
                <div className="p-5 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Doctor Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        name="specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all shadow-inner"
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
                      <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                    </div>

                    <input
                      type="number"
                      name="experience"
                      placeholder="Experience (in years)"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        placeholder="Clinic Location"
                        value={form.location}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner text-slate-800 placeholder:text-slate-400"
                      />
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    </div>

                    <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-inner">
                      <FileText className="text-slate-400 h-4 w-4 mr-2 shrink-0" />
                      <input
                        type="file"
                        name="certificateFile"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                        required
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Address Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input type="text" name="street" placeholder="Street Address" value={form.street} onChange={handleChange} required className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 pl-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" />
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  </div>
                  <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required className="px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" />
                  <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} required className="px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" />
                  <input type="text" name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} required className="px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  name="agreed" 
                  checked={form.agreed} 
                  onChange={handleChange} 
                  required 
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label className="text-xs text-slate-500 font-medium">I agree to the terms and conditions and privacy policy.</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3.5 text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              <p className="text-center text-sm text-slate-500 pt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;