import React from 'react';
import { ChevronLeft, MapPin, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function DoctorsPage() {
  const doctors = [
    {
      name: 'Dr. Aarthi Ramesh',
      specialty: 'Dermatologist',
      experience: '10+ years',
      location: 'Chennai, TN',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Dr. Vishal Menon',
      specialty: 'Dermatologist',
      experience: '8 years',
      location: 'Coimbatore, TN',
      image: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    {
      name: 'Dr. Priya Sharma',
      specialty: 'Dermatologist',
      experience: '12 years',
      location: 'Madurai, TN',
      image: 'https://randomuser.me/api/portraits/women/47.jpg'
    }
  ];

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
        {doctors.map((doctor, index) => (
          <div
            key={index}
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsPage;
