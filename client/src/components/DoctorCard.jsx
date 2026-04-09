import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, DollarSign } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

function DoctorCard({ doctor, showBookButton = true }) {
  const photoUrl = doctor.photo
    ? (doctor.photo.startsWith('http') ? doctor.photo : `${API_BASE}/${doctor.photo}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || 'Doctor')}&background=2563eb&color=fff&size=128`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition duration-300 flex flex-col overflow-hidden">
      {/* Photo */}
      <div className="h-36 bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
        <img
          src={photoUrl}
          alt={doctor.fullName}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            Dr. {doctor.fullName}
          </h3>
          {doctor.isVerified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-2 whitespace-nowrap">
              ✓ Verified
            </span>
          )}
        </div>

        <p className="text-sm text-blue-600 font-medium capitalize mb-2">{doctor.specialization}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{doctor.experience} yrs exp</span>
          {doctor.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.location}</span>}
          {doctor.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" />{doctor.rating.toFixed(1)}</span>
          )}
          {doctor.consultationFee && (
            <span className="flex items-center gap-1 text-green-600"><DollarSign className="w-3 h-3" />₹{doctor.consultationFee}</span>
          )}
        </div>

        {doctor.bio && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doctor.bio}</p>
        )}

        {/* Book Button */}
        {showBookButton && (
          <Link to={`/book/${doctor._id}`} className="mt-auto">
            <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition">
              Book Appointment
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default DoctorCard;
