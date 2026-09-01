import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ChevronLeft, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "./authcontext";
import Logo from "../../assets/FullLogo.jpg";
import GoogleLogo from "../../assets/google.png";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotForm, setForgotForm] = useState({ email: "", otp: "", newPassword: "" });
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const isMfaFlow = res.data?.mfaRequired || (res.data?.success && !res.data?.token);
      if (isMfaFlow) {
        setShowOtp(true);
        showToast(res.data.message || "OTP sent for MFA verification.", "success");
        return;
      }

      if (res.data?.token && res.data?.user) {
        const user = res.data.user;
        login(res.data.token, user);
        showToast(`Welcome ${user.fullName || 'back'}!`, "success");

        setTimeout(() => {
          if (user.role === "admin") navigate("/admin");
          else if (user.role === "doctor") navigate("/doctor/dashboard");
          else navigate("/");
        }, 500);
      } else {
        showToast("Login failed. Unexpected response.");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.post("/api/auth/verify-mfa", {
        email: form.email,
        otp: otp,
      });

      const user = res.data.user;
      login(res.data.token, user);
      showToast(`Welcome ${user.fullName || 'back'}!`, "success");

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "doctor") navigate("/doctor/dashboard");
        else navigate("/");
      }, 500);
    } catch (err) {
      showToast(err.response?.data?.message || "MFA verification failed. Check your OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      if (forgotStep === 1) {
        await api.post("/api/auth/forgot-password", { email: forgotForm.email });
        showToast("OTP sent to your email", "success");
        setForgotStep(2);
      } else {
        await api.post("/api/auth/reset-password", {
          email: forgotForm.email,
          otp: forgotForm.otp,
          newPassword: forgotForm.newPassword,
        });
        showToast("Password reset successful!", "success");
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotForm({ email: "", otp: "", newPassword: "" });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-6">
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
          toast.type === "success"
            ? "bg-emerald-600 text-white shadow-emerald-600/20"
            : "bg-rose-500 text-white shadow-rose-500/20"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden z-10">
        
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-100/60 p-10 border-r border-slate-100">
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Welcome Back
              </h2>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Log in to seamlessly access your CareConnect health dashboard and appointments.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">Please enter your account details below</p>
          </div>

          {showOtp ? (
            <div className="space-y-6">
              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-800">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the 6-digit secure code sent to <span className="font-semibold text-slate-700">{form.email}</span></p>
              </div>

              <form onSubmit={handleMfaVerify} className="space-y-5">
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
                  {isVerifying ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="w-full text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  ← Back to credentials
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3.5 text-sm rounded-2xl border border-slate-200 pl-11 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 text-sm rounded-2xl border border-slate-200 pl-11 pr-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 transition-all shadow-inner text-slate-800 placeholder:text-slate-400"
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3.5 text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3.5 px-4 text-sm rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all duration-200 group active:scale-[0.98]"
              >
                <img
                  src={GoogleLogo}
                  alt="Google Logo"
                  className="w-5 h-5 transition-transform group-hover:scale-105"
                />
                <span>Continue with Google</span>
              </button>

              {/* Signup Link */}
              <p className="text-center text-sm text-slate-500 pt-3">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
              }}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <Sparkles size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                {forgotStep === 1 ? "Forgot Password" : "Reset Password"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {forgotStep === 1 ? "We'll send a verification code to your email." : "Enter the verification code and your new secure password."}
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 1 ? (
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pl-11 text-sm bg-slate-50/50"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={forgotForm.otp}
                    onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50"
                    maxLength="6"
                  />
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={forgotForm.newPassword}
                      onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pl-11 text-sm bg-slate-50/50"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-2xl font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {isForgotLoading ? "Processing..." : forgotStep === 1 ? "Send Verification Code" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;