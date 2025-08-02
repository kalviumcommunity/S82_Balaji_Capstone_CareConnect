import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
import {ChevronLeft} from 'lucide-react'
const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const doctorId = '6854247c50c3bc09abc37deb'; // 🔁 Replace with logged-in doctor ID

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `https://s82-balaji-capstone-careconnect-4.onrender.com/api/doctors/${doctorId}/appointments`,
          { withCredentials: true }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
      <Link to="/" className="text-blue-700 flex items-center mb-6 hover:underline">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Home
            </Link>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appt) => (
            <li key={appt._id} className=" p-2 rounded shadow-sm">
              <p><strong>Date:</strong> {appt.date}</p>
              <p><strong>Time:</strong> {appt.time}</p>
              <p><strong>Patient:</strong> {appt.patient?.fullName || 'Unknown'}</p>
              <p><strong>Status:</strong> {appt.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorAppointments;
