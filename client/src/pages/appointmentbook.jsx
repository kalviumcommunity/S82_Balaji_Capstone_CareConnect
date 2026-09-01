import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import axios from 'axios';
import { Calendar, Clock, Video, CheckCircle, ChevronLeft, MapPin, Stethoscope, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';
const TIME_SLOTS = [
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

const BookAppointment = () => {
  const { doctorId } = useParams();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [notPatient, setNotPatient] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'patient') {
      setNotPatient(true);
    }
    // Fetch doctor info for display
    axios.get(`${API_BASE}/api/doctors/get`)
      .then(res => {
        const docs = res.data?.doctors || res.data;
        const found = Array.isArray(docs) ? docs.find(d => d._id === doctorId) : null;
        setDoctor(found);
      })
      .catch(() => {});

    axios.get(`${API_BASE}/api/doctors/availability/${doctorId}`)
      .then((res) => {
        setDoctorAvailability(res.data?.data || []);
      })
      .catch(() => setDoctorAvailability([]));
  }, [doctorId]);

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = date ? new Date(`${date}T12:00:00`) : null;
  const isWeekdaySelection = selectedDate ? [1, 2, 3, 4, 5, 6].includes(selectedDate.getDay()) : true;
  const selectedDayName = selectedDate ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()] : null;
  const availableSlotsForSelectedDay = selectedDayName
    ? (doctorAvailability.find((entry) => entry.day === selectedDayName)?.slots || [])
    : TIME_SLOTS;

  const handleDateChange = (value) => {
    setDate(value);
    setTime('');
    setMessage('');

    if (value) {
      const selected = new Date(`${value}T12:00:00`);
      const weekday = [1, 2, 3, 4, 5, 6].includes(selected.getDay());
      if (!weekday) {
        setMessage('Appointments are available from Monday to Saturday.');
      }
    }
  };

  const handleBooking = async () => {
    if (!date || !time) {
      setMessage('Please select both a date and time.');
      return;
    }

    if (!isWeekdaySelection) {
      setMessage('Appointments are available from Monday to Saturday.');
      return;
    }

    if (!TIME_SLOTS.includes(time)) {
      setMessage('Please choose a valid slot between 9:00 AM and 6:00 PM.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/appointments', {
        doctorId,
        date,
        time,
      });
      setMeetingLink(res.data.data?.meetingLink || res.data.meetingLink);
      setBooked(true);
      setMessage('Appointment booked successfully! A confirmation email has been sent.');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Booking failed. Try another slot.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (notPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Login Required</h2>
          <p className="text-slate-500 mb-6 text-sm font-medium">Only patients can book appointments.</p>
          <Link to="/login">
            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all">Go to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-cyan-100/40 to-blue-200/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-indigo-100/40 to-sky-100/30 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-xl mx-auto relative z-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-all bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow group">
            <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Home
          </Link>
        </div>

        {/* Doctor info header */}
        {doctor && (
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-200/70 p-6 mb-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>
            <img
              src={doctor.photo || doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || 'Doctor')}&background=2563eb&color=fff&size=80`}
              alt={doctor.fullName}
              className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-xl text-slate-900">{doctor.fullName}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-600 capitalize flex items-center gap-1.5 mb-1">
                <Stethoscope className="w-3.5 h-3.5" /> {doctor.specialization}
              </p>
              {doctor.location && (
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" /> {doctor.location}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Booking card */}
        {!booked ? (
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200/70 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>
            
            <h1 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              📅 Book Appointment
            </h1>

            <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Date</label>
            <div className="relative mb-6">
              <Calendar className="absolute left-4 top-3.5 text-cyan-500 w-4 h-4" />
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium transition"
              />
            </div>

            <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Time Slot</label>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-[0.18em]">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Schedule based on doctor availability
              </div>

              {doctorAvailability.length > 0 && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700 mb-2">Doctor availability</div>
                  <div className="flex flex-wrap gap-2">
                    {doctorAvailability.map((entry) => (
                      <span key={entry.day} className="rounded-full bg-white border border-slate-200 px-2.5 py-1">
                        {entry.day}: {entry.slots.join(', ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {(date && selectedDayName ? availableSlotsForSelectedDay : TIME_SLOTS).map((slot) => {
                  const isSelected = time === slot;
                  const slotDisabled = !isWeekdaySelection || (date && selectedDayName && !availableSlotsForSelectedDay.includes(slot));

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => !slotDisabled && setTime(slot)}
                      disabled={slotDisabled}
                      className={`py-3 px-3 rounded-2xl border text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                      } ${slotDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className="mb-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl p-4 font-medium shadow-sm">
                {message}
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Booking...' : 'Confirm Booking'}
            </button>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200/70 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>

            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Appointment Confirmed!</h2>
            <p className="text-slate-500 mb-6 text-sm font-medium">{message}</p>

            {meetingLink && (
              <div className="bg-blue-50/60 border border-blue-200/60 rounded-3xl p-5 mb-6 text-left">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-2 text-sm">
                  <Video className="w-4 h-4 text-blue-600" /> Video Meeting Link
                </div>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 underline break-all mb-4 font-medium"
                >
                  {meetingLink}
                </a>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer">
                  <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" /> Join Meeting
                  </button>
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <Link to="/" className="flex-1">
                <button className="w-full py-3.5 border border-slate-200/80 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition">
                  Back to Home
                </button>
              </Link>
              <Link to="/profile" className="flex-1">
                <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-2xl shadow-md hover:opacity-95 transition">
                  My Bookings
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;