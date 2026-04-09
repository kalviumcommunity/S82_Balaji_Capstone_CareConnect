import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChevronLeft, Video, Calendar, Clock, CheckCircle, XCircle, Clock3 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const statusConfig = {
  booked: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: <Clock3 className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
};

import load from '../assets/Animation - 1750351638911.gif';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(
        `${API_BASE}/api/profile/upload-profile-photo`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setUser((prev) => ({ ...prev, doctor: { ...prev.doctor, image: res.data.imageUrl } }));
      alert('Profile photo updated successfully!');
    } catch (error) {
      alert('Failed to upload image');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/patientprofile/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const userData = res.data.user;
        setUser(userData);

        // Fetch appointments for patients
        if (userData.role === 'patient' && userData.patient?._id) {
          setApptLoading(true);
          try {
            const apptRes = await axios.get(`${API_BASE}/api/appointments/patient/${userData.patient._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(apptRes.data);
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
    if (token) fetchProfile();
    else setLoading(false);
  }, [token]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-blue-600">
        <img src={load} alt="Loading..." className="w-40 h-40 mb-4" />
        <p className="text-blue-600 text-lg font-semibold">Loading profile...</p>
      </div>
    );

  if (!user)
    return (
      <div className="text-center p-10 text-red-600">
        <p>User not logged in or failed to load profile.</p>
        <Link to="/login" className="text-blue-600 underline">Login</Link>
      </div>
    );

  let certificateUrl = null;
  if (user?.role === 'doctor' && user.doctor?.certificateUrl) {
    certificateUrl = `${API_BASE}/${user.doctor.certificateUrl}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b w-full from-blue-100 to-white p-8">
      <Link to="/" className="text-blue-700 flex items-center mb-6 hover:underline">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
      </Link>

      <div className="bg-white shadow-xl rounded-xl p-6 max-w-3xl mx-auto">
        {/* ── Doctor Profile ────────────────────────────────────── */}
        {user.role === 'doctor' && (
          <div className="flex flex-col items-center text-center">
            <img
              src={user.doctor?.image
                ? `${user.doctor.image}?t=${Date.now()}`
                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
              alt={user.doctor?.fullName}
              className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-blue-300"
            />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profileImageInput" />
            <label htmlFor="profileImageInput" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Change Photo
            </label>
            <h1 className="text-3xl font-bold my-3">{user.doctor?.fullName}</h1>
            <Link to="/doctor/dashboard" className="mb-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Go to Dashboard
            </Link>
            <div className="w-full max-w-md text-left space-y-2">
              <p><strong>Email:</strong> {user.doctor?.email}</p>
              <p><strong>Specialization:</strong> {user.doctor?.specialization}</p>
              <p><strong>Experience:</strong> {user.doctor?.experience} years</p>
              <p><strong>Location:</strong> {user.doctor?.location}</p>
              <p><strong>Status:</strong>{' '}
                <span className={user.doctor?.isVerified ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                  {user.doctor?.isVerified ? '✅ Verified' : '⏳ Pending Admin Approval'}
                </span>
              </p>
              {user.doctor?.bio && <p><strong>Bio:</strong> {user.doctor.bio}</p>}
              {user.doctor?.consultationFee && <p><strong>Consultation Fee:</strong> ₹{user.doctor.consultationFee}</p>}
              {user.doctor?.certificateUrl ? (
                <>
                  <p><strong>Certificate:</strong>{' '}
                    <button onClick={() => setShowModal(true)} className="text-blue-600 underline hover:text-blue-800">View Certificate</button>
                  </p>
                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                      <div className="bg-black p-6 rounded-lg max-w-3xl shadow-xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-2 right-3 text-gray-300 hover:text-red-500 text-2xl font-bold">×</button>
                        {user.doctor.certificateUrl.endsWith('.pdf') ? (
                          <iframe src={certificateUrl} title="Certificate" className="w-[600px] h-[500px] border rounded" />
                        ) : (
                          <img src={certificateUrl} alt="Certificate" className="w-full max-h-[500px] object-contain rounded" />
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p><strong>Certificate:</strong> <span className="text-gray-500">Not uploaded</span></p>
              )}
            </div>
            <div className="mt-6 w-full max-w-md text-left">
              <h3 className="font-semibold mb-2">Addresses:</h3>
              {user.doctor?.addresses?.length > 0 ? (
                user.doctor.addresses.map((addr, i) => (
                  <div key={i} className="text-sm pl-4 mb-2 border-l-2 border-blue-300">
                    <p>{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No addresses available.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Patient Profile ───────────────────────────────────── */}
        {user.role === 'patient' && (
          <>
            <h1 className="text-3xl font-bold mb-1">{user.patient?.fullName}</h1>
            <p className="text-gray-500 mb-1">Role: Patient</p>
            <p className="mb-1"><strong>Email:</strong> {user.patient?.email}</p>
            {user.patient?.phone && <p className="mb-1"><strong>Phone:</strong> {user.patient.phone}</p>}
            {user.patient?.bloodGroup && <p className="mb-1"><strong>Blood Group:</strong> {user.patient.bloodGroup}</p>}

            <div className="mt-5">
              <h3 className="font-semibold mb-2">Address:</h3>
              {user.patient?.address ? (
                <p className="text-sm pl-4 text-gray-700">
                  {user.patient.address.line1}, {user.patient.address.city}, {user.patient.address.state} - {user.patient.address.pincode}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No address available.</p>
              )}
            </div>

            {/* ── Recent Bookings ──────────────────────────────── */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> My Recent Bookings
              </h3>
              {apptLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No bookings yet.</p>
                  <Link to="/speciality" className="text-blue-600 text-sm underline">Find a Doctor</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const sc = statusConfig[appt.status] || statusConfig.booked;
                    return (
                      <div key={appt._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:shadow-sm transition">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Dr. {appt.doctor?.fullName}
                            </p>
                            <p className="text-xs text-blue-600 capitalize">{appt.doctor?.specialization}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                            {appt.meetingLink && appt.status === 'booked' && (
                              <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer">
                                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                                  <Video className="w-3 h-3" /> Join Meeting
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
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
