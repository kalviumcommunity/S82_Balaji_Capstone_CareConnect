import React, { useState, useEffect } from 'react';
import { useParams,Link } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    // Get patient info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'patient') {
      setPatientId(user._id); // or user.id depending on backend response
    } else {
      setMessage('Only patients can book appointments.');
    }
    console.log("User from localStorage:", user);

  }, []);

  const handleBooking = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/appointments', {
        doctorId,
        patientId,
        date,
        time,
      });

      setMessage('Appointment booked successfully!');
    } catch (error) {
      console.error('Booking failed:', error);
      setMessage('Booking failed. Try another slot.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-gradient-to-b from-white to-sky-50">
      <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>

      {message && <p className="text-blue-700 mb-4">{message}</p>}

      {patientId ? (
        <>
          <label className="block mb-2">Date:</label>
<input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  className="border p-2 mb-4 w-[45%] rounded"
/>

<label className="block mb-2">Time:</label>
<input
  type="time"
  value={time}
  onChange={(e) => setTime(e.target.value)}
  className="border p-2 mb-4 w-[45%] rounded"
/>

<br />

          <button
            onClick={handleBooking}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Confirm Booking
          </button>
        </>
      ) : (
        <div>
        <p className="text-red-600">Login as a patient to book an appointment.</p>
        <Link to='/login'>
        <button className='text-blue-600 underline hover:text-red-500'>Login</button>
        </Link>
        </div>
        
      )}
    </div>
  );
};

export default BookAppointment;
