import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, BadgeCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  // Delete doctor
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/doctors/${id}`);
      fetchDoctors(); // Refresh list
    } catch (err) {
      console.error('Failed to delete doctor', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white px-4 py-10">
      
      {/* Back to Home */}
      <Link to="/" className="flex items-center text-blue-700 hover:underline mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center md:text-left">
        Available Dermatologists
      </h1>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition hover:shadow-xl"
          >
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-28 h-28 rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold text-blue-700">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <BadgeCheck className="w-4 h-4" />
              <span>{doctor.experience} experience</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{doctor.location}</span>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(doctor._id)}
              className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsPage;
