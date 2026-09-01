import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { ChevronLeft, Video, Calendar, Clock, CheckCircle, XCircle, Clock3, Mail, MapPin, Award, Stethoscope, Droplet, Phone, ShieldCheck, FileText, Camera, Sparkles, Building2, UserCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const statusConfig = {
  booked: { label: 'Upcoming', color: 'bg-sky-50 text-sky-700 border border-sky-200/80', icon: <Clock3 className="w-3.5 h-3.5 text-sky-500" /> },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border border-rose-200/80', icon: <XCircle className="w-3.5 h-3.5 text-rose-500" /> },
};

import load from '../assets/Animation - 1750351638911.gif';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post(
        '/api/profile/upload-profile-photo',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUser((prev) => {
        const imageUrl = res.data.data?.imageUrl || res.data.imageUrl;
        if (!prev) return prev;
        if (prev.role === 'doctor') {
          return { ...prev, doctor: { ...prev.doctor, image: imageUrl } };
        }
        return { ...prev, patient: { ...prev.patient, image: imageUrl } };
      });
      showToast('Profile photo updated successfully!');
    } catch (error) {
      showToast('Failed to upload image');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile/get-profile');
        const payload = res.data?.data || res.data;
        let userData;

        if (payload?.role) {
          const userObj = payload?.user || payload; 
          if (payload.role === 'doctor') {
            userData = { role: 'doctor', doctor: userObj };
          } else {
            userData = { role: 'patient', patient: userObj };
          }
        } else {
          userData = payload;
        }

        setUser(userData);

        if (userData.role === 'patient' && userData.patient?._id) {
          setApptLoading(true);
          try {
            const apptRes = await api.get('/api/appointments/patient');
            setAppointments(apptRes.data.data || apptRes.data);
          } catch {
            // Non-critical
          } finally {
            setApptLoading(false);
          }
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    const token = localStorage.getItem('token');
    if (token) fetchProfile();
    else setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-blue-600">
        <img src={load} alt="Loading..." className="w-32 h-32 mb-4 object-contain animate-pulse" />
        <p className="text-slate-600 text-base font-semibold tracking-wide">Loading your profile...</p>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
            <UserCircle2 size={30} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Session Expired</h2>
          <p className="text-slate-500 text-sm mb-6">User not logged in or failed to load profile data.</p>
          <Link to="/login" className="inline-block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">Sign In</Link>
        </div>
      </div>
    );

  let certificateUrl = null;
  if (user?.role === 'doctor' && user.doctor?.certificateUrl) {
    certificateUrl = `${API_BASE}/${user.doctor.certificateUrl}`;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Decorative ambient background lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-100/70 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-100/70 rounded-full blur-3xl pointer-events-none"></div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-2xl font-medium text-sm border border-slate-800 transition-all animate-bounce">
          {toast}
        </div>
      )}

      {/* Back Link */}
      <div className="max-w-4xl mx-auto mb-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-all group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 p-6 sm:p-10 relative overflow-hidden">
          
          {/* ── Doctor Profile ────────────────────────────────────── */}
          {user.role === 'doctor' && (
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <img
                  src={user.doctor?.image
                    ? `${user.doctor.image}?t=${Date.now()}`
                    : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                  alt={user.doctor?.fullName}
                  className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white ring-4 ring-blue-500/10 transition-transform group-hover:scale-[1.02]"
                />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profileImageInput" />
                <label htmlFor="profileImageInput" className="absolute bottom-[-6px] right-[-6px] cursor-pointer bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center border-2 border-white active:scale-95">
                  <Camera className="w-4 h-4" />
                </label>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.doctor?.fullName}</h1>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 mb-6 shadow-sm">
                <Sparkles size={12} /> Verified Medical Specialist
              </span>
              
              <div className="mb-8">
                <Link to="/doctor/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                  Go to Dashboard
                </Link>
              </div>

              <div className="w-full max-w-xl bg-slate-50/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-5 text-left shadow-inner">
                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 shrink-0 border border-slate-200/80 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Email Address</span>
                    <span className="font-semibold text-slate-800 text-sm">{user.doctor?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 shrink-0 border border-slate-200/80 shadow-sm">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Specialization</span>
                    <span className="font-semibold text-slate-800 text-sm capitalize">{user.doctor?.specialization}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 shrink-0 border border-slate-200/80 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Experience</span>
                    <span className="font-semibold text-slate-800 text-sm">{user.doctor?.experience} years</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 shrink-0 border border-slate-200/80 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Location</span>
                    <span className="font-semibold text-slate-800 text-sm">{user.doctor?.location || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 shrink-0 border border-slate-200/80 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Verification Status</span>
                    <span className={user.doctor?.isVerified ? 'text-emerald-600 font-semibold text-sm' : 'text-amber-600 font-semibold text-sm'}>
                      {user.doctor?.isVerified ? '✅ Verified Specialist' : '⏳ Pending Admin Approval'}
                    </span>
                  </div>
                </div>

                {user.doctor?.bio && (
                  <div className="pt-4 border-t border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1.5">Biography</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{user.doctor.bio}</p>
                  </div>
                )}

                {user.doctor?.consultationFee && (
                  <div className="pt-4 border-t border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">Consultation Fee</span>
                    <p className="text-base text-slate-900 font-bold">₹{user.doctor.consultationFee}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Professional Certificate</span>
                  {user.doctor?.certificateUrl ? (
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition shadow-sm">
                      <FileText className="w-4 h-4" /> View Certificate
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not uploaded</span>
                  )}
                </div>

                {showModal && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-200">
                      <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center transition font-bold">✕</button>
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Certificate Preview</h3>
                      {user.doctor.certificateUrl.endsWith('.pdf') ? (
                        <iframe src={certificateUrl} title="Certificate" className="w-full h-[500px] border-0 rounded-2xl bg-slate-50" />
                      ) : (
                        <img src={certificateUrl} alt="Certificate" className="w-full max-h-[500px] object-contain rounded-2xl bg-slate-50" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 w-full max-w-xl text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" /> Clinics & Addresses:
                </h3>
                {user.doctor?.addresses?.length > 0 ? (
                  <div className="space-y-3">
                    {user.doctor.addresses.map((addr, i) => (
                      <div key={i} className="text-sm p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-sm">
                        <p className="font-semibold text-slate-800">{addr.line1}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                    <p className="text-sm text-slate-400 font-medium">No addresses available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Patient Profile ───────────────────────────────────── */}
          {user.role === 'patient' && (
            <div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left bg-slate-50/60 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-inner">
                <div className="relative group shrink-0">
                  <img
                    src={user.patient?.image
                      ? `${user.patient.image}?t=${Date.now()}`
                      : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                    alt={user.patient?.fullName}
                    className="w-28 h-28 rounded-3xl object-cover shadow-xl border-4 border-white ring-4 ring-blue-500/10 transition-transform group-hover:scale-[1.02]"
                  />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profileImageInput" />
                  <label htmlFor="profileImageInput" className="absolute bottom-[-6px] right-[-6px] cursor-pointer bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center border-2 border-white active:scale-95">
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{user.patient?.fullName}</h1>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 mb-4 shadow-sm">Patient Profile</span>
                  <div className="space-y-2 text-sm text-slate-600 font-medium">
                    <p className="flex items-center justify-center sm:justify-start gap-2.5"><Mail className="w-4 h-4 text-blue-600" /> {user.patient?.email}</p>
                    {user.patient?.phone && <p className="flex items-center justify-center sm:justify-start gap-2.5"><Phone className="w-4 h-4 text-blue-600" /> {user.patient.phone}</p>}
                    {user.patient?.bloodGroup && <p className="flex items-center justify-center sm:justify-start gap-2.5"><Droplet className="w-4 h-4 text-rose-500" /> Blood Group: <strong className="text-slate-900 font-bold">{user.patient.bloodGroup}</strong></p>}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 mb-8 shadow-inner">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Address Details
                </h3>
                {user.patient?.address ? (
                  <p className="text-sm text-slate-700 font-medium pl-6">
                    {user.patient.address.line1}, {user.patient.address.city}, {user.patient.address.state} - {user.patient.address.pincode}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 font-medium pl-6">No address available.</p>
                )}
              </div>

              {/* ── Recent Bookings ──────────────────────────────── */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  My Recent Bookings
                </h3>
                {apptLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-600 font-semibold mb-2">No bookings yet.</p>
                    <Link to="/speciality" className="inline-block text-blue-600 text-sm font-semibold hover:underline">Find a Doctor</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => {
                      const sc = statusConfig[appt.status] || statusConfig.booked;
                      return (
                        <div key={appt._id} className="border border-slate-200/80 rounded-3xl p-5 bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl transition">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <p className="font-bold text-lg text-slate-900">
                                Dr. {appt.doctor?.fullName}
                              </p>
                              <p className="text-xs font-semibold text-blue-600 capitalize mt-0.5">{appt.doctor?.specialization}</p>
                              <div className="flex items-center gap-4 mt-2.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl w-fit border border-slate-100">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-600" />{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" />{appt.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm ${sc.color}`}>
                                {sc.icon} {sc.label}
                              </span>
                              {appt.meetingLink && appt.status === 'booked' && (
                                <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer">
                                  <button className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition active:scale-95">
                                    <Video className="w-4 h-4" /> Join Meeting
                                  </button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;