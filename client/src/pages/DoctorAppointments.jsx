import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, User, Video, CheckCircle, XCircle, Clock3 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const statusConfig = {
  booked: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock3 className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { setError('Not logged in.'); setLoading(false); return; }
    const fetchAppointments = async () => {
      try {
        // Uses JWT token — no hardcoded doctor ID needed
        const res = await axios.get(`${API_BASE}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

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

  const isPastAppointment = (date) => {
    const apptDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apptDate < today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/doctor/dashboard" className="text-blue-700 flex items-center mb-6 hover:underline">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-xl shadow-sm" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const sc = statusConfig[appt.status] || statusConfig.booked;
              return (
                <div key={appt._id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{appt.patient?.fullName || 'Unknown Patient'}</p>
                      <p className="text-xs text-gray-500">{appt.patient?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" />
                      {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" />{appt.time}</span>
                    <span className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  {appt.meetingLink && appt.status === 'booked' && (
                    <div className="flex gap-2">
                       <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
