import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from './authentication/authcontext';
import { Video, Calendar, Clock, User, CheckCircle, XCircle, Clock3, Stethoscope, LogOut, ArrowRight, Sparkles } from 'lucide-react';

const statusConfig = {
  booked: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border border-amber-200/60', icon: <Clock3 className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-600 border border-rose-200/60', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_OPTIONS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const doctorName = user?.fullName || 'Doctor';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user || user.role !== 'doctor') { navigate('/login'); return; }

    const fetchAppointments = async () => {
      try {
        const res = await api.get('/api/appointments/doctor');
        setAppointments(res.data.data || res.data);
      } catch (err) {
        setError('Failed to load appointments. Please refresh.');
      }
    };

    const fetchAvailability = async () => {
      try {
        const res = await api.get(`/api/doctors/availability/${user._id}`);
        setAvailability(res.data?.data || []);
      } catch (err) {
        setAvailability([]);
      }
    };

    fetchAppointments();
    fetchAvailability();
    setLoading(false);
  }, [user, navigate]);

  const handleStatusUpdate = async (apptId, newStatus) => {
    try {
      await api.patch(`/api/appointments/status/${apptId}`, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isPastAppointment = (date) => {
    const apptDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apptDate < today;
  };

  const pending = appointments.filter(a => a.status === 'booked');
  const others = appointments.filter(a => a.status !== 'booked');

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const existing = prev.find((entry) => entry.day === day);
      if (existing) {
        return prev.filter((entry) => entry.day !== day);
      }

      return [...prev, { day, slots: [] }];
    });
  };

  const toggleSlot = (day, slot) => {
    setAvailability((prev) => prev.map((entry) => {
      if (entry.day !== day) {
        return entry;
      }

      const hasSlot = entry.slots.includes(slot);
      return {
        ...entry,
        slots: hasSlot ? entry.slots.filter((s) => s !== slot) : [...entry.slots, slot],
      };
    }));
  };

  const saveAvailability = async () => {
    if (!user?._id) {
      return;
    }

    setSavingSchedule(true);
    setError('');

    try {
      const payload = availability.filter((entry) => entry.slots.length > 0);
      await api.put(`/api/doctors/availability/${user._id}`, { availability: payload });
      setError('');
    } catch (err) {
      setError('Failed to save availability.');
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800">
      {/* Decorative ambient background lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CareConnect</h1>
        </div>
        <ul className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/doctor/appointments')}>Appointments</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/profile')}>Profile</li>
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all font-medium border border-rose-100 shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </li>
        </ul>
      </nav>

      <div className="max-w-5xl mx-auto p-6 md:p-8 relative z-10">
        {/* Welcome */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                <Sparkles size={12} /> Doctor Portal
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Dr. {doctorName} 👨‍⚕️</h2>
            <p className="text-slate-500 text-sm mt-1">Here's your appointment overview and patient management hub.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pending Appointments', value: pending.length, color: 'bg-amber-50/80 border-amber-200 text-amber-700', iconBg: 'bg-amber-100 text-amber-600' },
            { label: 'Completed Consultations', value: appointments.filter(a => a.status === 'completed').length, color: 'bg-emerald-50/80 border-emerald-200 text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600' },
            { label: 'Cancelled Bookings', value: appointments.filter(a => a.status === 'cancelled').length, color: 'bg-rose-50/80 border-rose-200 text-rose-600', iconBg: 'bg-rose-100 text-rose-500' },
          ].map((s) => (
            <div key={s.label} className={`border rounded-3xl p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl bg-white/80 flex items-center gap-5`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${s.iconBg}`}>
                {s.value}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <div className="mb-8 bg-white/90 border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Set Weekly Availability</h3>
              <p className="text-sm text-slate-500 mt-1">Select your working days and the time slots patients can book.</p>
            </div>
            <button
              type="button"
              onClick={saveAvailability}
              disabled={savingSchedule}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-60"
            >
              {savingSchedule ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {DAYS.map((day) => {
              const dayEntry = availability.find((entry) => entry.day === day);
              const selected = Boolean(dayEntry);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayEntry = availability.find((entry) => entry.day === day);
              const enabled = Boolean(dayEntry);

              return (
                <div key={day} className={`rounded-2xl border p-4 ${enabled ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800">{day}</span>
                    <span className="text-xs font-medium text-slate-500">{enabled ? 'Active' : 'Inactive'}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SLOT_OPTIONS.map((slot) => {
                      const selected = Boolean(dayEntry?.slots.includes(slot));

                      return (
                        <button
                          key={`${day}-${slot}`}
                          type="button"
                          disabled={!enabled}
                          onClick={() => toggleSlot(day, slot)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            selected
                              ? 'border-green-500 bg-green-600 text-white'
                              : enabled
                                ? 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
                                : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                <Clock3 className="w-5 h-5" />
              </div> 
              Pending Appointments
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{pending.length} Active</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-slate-500 font-medium text-sm">No pending appointments 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((appt) => (
                <div 
                  key={appt._id} 
                  className={`border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-200 shadow-sm ${
                    isPastAppointment(appt.date) 
                      ? 'border-orange-200 bg-orange-50/60' 
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-inner">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{appt.patient?.fullName || 'Unknown Patient'}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{appt.patient?.email}</p>
                      {isPastAppointment(appt.date) && (
                        <span className="inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full">
                          Past Due
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-inner">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {appt.time}
                    </span>
                  </div>

                  {appt.meetingLink && appt.status === 'booked' && (
                    <div className="flex items-center gap-2.5">
                       <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                          <Video className="w-4 h-4" /> Join Call
                        </button>
                      </a>
                      <button 
                        onClick={() => handleStatusUpdate(appt._id, 'completed')}
                        className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        Complete
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                         className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl hover:bg-rose-100 transition-all active:scale-95"
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
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              Appointment History
            </h3>
            <div className="space-y-3">
              {others.map((appt) => {
                const sc = statusConfig[appt.status] || statusConfig.booked;
                return (
                  <div key={appt._id} className="flex items-center justify-between border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl transition-all">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{appt.patient?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Date(appt.date).toLocaleDateString()} · {appt.time}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${sc.color}`}>
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