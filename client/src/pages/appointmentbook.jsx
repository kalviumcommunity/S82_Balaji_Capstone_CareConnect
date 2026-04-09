import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Video, CheckCircle, ChevronLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [notPatient, setNotPatient] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role === 'patient') {
      setPatientId(user._id || user.id);
    } else {
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
  }, [doctorId]);

  const today = new Date().toISOString().split('T')[0];

  const handleBooking = async () => {
    if (!date || !time) {
      setMessage('Please select both a date and time.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/appointments`, {
        doctorId,
        patientId,
        date,
        time,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetingLink(res.data.meetingLink);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Login Required</h2>
        <p className="text-gray-500 mb-6">Only patients can book appointments.</p>
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Go to Login</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="flex items-center text-blue-600 hover:underline mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
        </Link>

        {/* Doctor info header */}
        {doctor && (
          <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center gap-4">
            <img
              src={doctor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || 'Doctor')}&background=2563eb&color=fff&size=80`}
              alt={doctor.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
            />
            <div>
              <h2 className="font-bold text-gray-900">{doctor.fullName}</h2>
              <p className="text-sm text-blue-600 capitalize">{doctor.specialization}</p>
              <p className="text-xs text-gray-500">{doctor.location}</p>
            </div>
          </div>
        )}

        {/* Booking card */}
        {!booked ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 Book Appointment</h1>

            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <div className="relative mb-5">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
            <div className="relative mb-6">
              <Clock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {message && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{message}</p>
            )}

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-500 mb-6">{message}</p>

            {meetingLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <Video className="w-5 h-5" /> Video Meeting Link
                </div>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 underline break-all mb-4"
                >
                  {meetingLink}
                </a>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer">
                  <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Video className="w-5 h-5" /> Join Meeting
                  </button>
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <Link to="/" className="flex-1">
                <button className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition">
                  Back to Home
                </button>
              </Link>
              <Link to="/profile" className="flex-1">
                <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
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
