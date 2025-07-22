import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, BadgeCheck, Trash2, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function DoctorsPage() {
  const { specialty } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`https://s82-balaji-capstone-careconnect-4.onrender.com/api/doctors/specialty/${specialty}`);
      setDoctors(res.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('https://s82-balaji-capstone-careconnect-4.onrender.com/api/patients/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(res.data.user);
      } catch (err) {
        console.log('Profile fetch error:', err);
      }
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchProfile();
  }, [specialty]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://s82-balaji-capstone-careconnect-4.onrender.com/api/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteMessage("Doctor deleted successfully ✅");

      setTimeout(() => {
        setDeleteMessage("");
      }, 2000);

      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete doctor', err);
      setDeleteMessage("Failed to delete doctor ❌");

      setTimeout(() => {
        setDeleteMessage("");
      }, 2000);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.specialization.toLowerCase().replace(/\s+/g, '') ===
      specialty?.toLowerCase().replace(/\s+/g, '')
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white px-4 py-10">
      <Link to="/speciality" className="flex items-center text-blue-700 hover:underline mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Speciality
      </Link>

      <h1 className="text-3xl font-bold text-blue-800 mb-4 text-center md:text-left capitalize">
        {specialty} Doctors
      </h1>

      {deleteMessage && (
        <div className="text-center mb-6 text-green-600 font-semibold transition-all duration-500">
          {deleteMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className='col-span-full flex flex-col items-center justify-center'>
            <img
              src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXYwY2hweGYzOXB0cnljNWIzNzc3dWU0aGV6ZGRmN2QyYnp5a240YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gfsQffBnuc6e096brx/giphy.gif"
              alt="No Doctors Found"
              className="w-80 max-w-full mb-4 relative-flex rounded-xl"
            />
            <p className="text-center text-gray-600 col-span-full">No doctors found for {specialty}.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => {
                setSelectedDoctor(doctor);
                setShowModal(true);
              }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition hover:shadow-xl cursor-pointer"
            >
              <img
                src={doctor.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                alt={doctor.fullName}
                className="w-28 h-28 rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-blue-700">{doctor.fullName}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <BadgeCheck className="w-4 h-4" />
                <span>{doctor.experience} experience</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>

              {currentUser?.role === 'doctor' && currentUser?.doctor?._id === doctor._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doctor._id);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && selectedDoctor && (
  <div className="fixed inset-0 z-50 bg-gray-300 bg-opacity-40 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-2xl overflow-auto max-h-[90vh]">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-2 right-3 text-gray-600 hover:text-red-500"
      >
        <X className="w-5 h-5" />
      </button>

      <img
        src={selectedDoctor.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
        alt={selectedDoctor.fullName}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-blue-500"
      />
      <h2 className="text-xl font-bold text-center text-blue-700">{selectedDoctor.fullName}</h2>
      <p className="text-sm text-center text-gray-600 mb-1">{selectedDoctor.title}</p>
      <p className="text-sm text-center text-gray-600 mb-2">{selectedDoctor.specialization || "Lecturer of dermatology"}</p>

      <div className="flex justify-between items-center mt-3 mb-2 px-8 text-yellow-500">
        <span>⭐{selectedDoctor.rating || 4.5}</span>
      </div>

      <div className="text-xs text-center font-medium mb-3 px-4 text-gray-700">
        <p className="font-semibold">{selectedDoctor.clinicName || "Samir Shehata Mohamed Clinic"}</p>
        <p><strong>{selectedDoctor.city || "Assiut City"}:</strong> {selectedDoctor.address || "Yousry Rageb Street, Above Al Araby Juice"}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs text-center text-blue-700 mb-3 px-6">
        <div>
          <div className="text-lg">⏱</div>
          <p>{selectedDoctor.waitingTime || "10 minutes"}</p>
        </div>
        <div>
          <div className="text-lg">💰</div>
          <p>{selectedDoctor.fee ? `${selectedDoctor.fee} EGP` : "650 EGP"}</p>
        </div>
        <div>
          <div className="text-lg">📞</div>
          <p>{selectedDoctor.phone || "01201111344"}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mb-4">First In First Out</p>

      
    </div>
  </div>
)}

    </div>
  );
}

export default DoctorsPage;
