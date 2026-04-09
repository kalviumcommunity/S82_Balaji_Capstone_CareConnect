import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Calendar, Clock, User, CheckCircle, XCircle, Clock3 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const statusConfig = {
  booked: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock3 className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Doctor');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    // Get doctor name from localStorage
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.fullName) setDoctorName(u.fullName);
    } catch {}

    if (!token) { navigate('/login'); return; }

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        setError('Failed to load appointments. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (apptId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/appointments/status/${apptId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const isPastAppointment = (date, time) => {
    const apptDate = new Date(date);
    // Rough check for "past" — only checks the date.
    // To be more precise, we could parse "time" (e.g., "10:30 AM") but that's complex
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apptDate < today;
  };

  const pending = appointments.filter(a => a.status === 'booked');
  const others = appointments.filter(a => a.status !== 'booked');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-xl font-bold text-blue-700">CareConnect</h1>
        <ul className="flex gap-6 text-sm font-medium text-gray-700">
          <li className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Home</li>
          <li className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/doctor/appointments')}>Appointments</li>
          <li className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/profile')}>Profile</li>
          <li className="hover:text-red-500 cursor-pointer text-red-500" onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Welcome back, Dr. {doctorName} 👨‍⚕️</h2>
          <p className="text-gray-500 mt-1">Here's your appointment overview for today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', value: pending.length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'bg-red-50 border-red-200 text-red-600' },
          ].map((s) => (
            <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Pending Appointments */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock3 className="text-yellow-500 w-5 h-5" /> Pending Appointments
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending appointments 🎉</p>
          ) : (
            <div className="space-y-3">
              {pending.map((appt) => (
                <div key={appt._id} className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isPastAppointment(appt.date) ? 'border-orange-200 bg-orange-50' : 'border-yellow-100 bg-yellow-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{appt.patient?.fullName || 'Unknown Patient'}</p>
                      <p className="text-xs text-gray-500">{appt.patient?.email}</p>
                      {isPastAppointment(appt.date) && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Past Due</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-400" />
                      {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-400" />{appt.time}</span>
                  </div>
                  {appt.meetingLink && appt.status === 'booked' && (
                    <div className="flex gap-2">
                       <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition">
                          <Video className="w-4 h-4" /> Join
                        </button>
                      </a>
                      <button 
                        onClick={() => handleStatusUpdate(appt._id, 'completed')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full hover:bg-green-700 transition"
                      >
                        Complete
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                         className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-full hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other Appointments */}
        {others.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Appointment History</h3>
            <div className="space-y-2">
              {others.map((appt) => {
                const sc = statusConfig[appt.status] || statusConfig.booked;
                return (
                  <div key={appt._id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{appt.patient?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(appt.date).toLocaleDateString()} · {appt.time}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
