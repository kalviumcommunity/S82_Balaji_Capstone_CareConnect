// pages/SpecializationDoctors.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const SpecializationDoctors = () => {
  const { specialty: specialization } = useParams(); // ✅ Rename on the fly
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if(!specialization) return;
        const res = await axios.get(`https://s82-balaji-capstone-careconnect-4.onrender.com/api/doctors/specialty/${specialization.toLowerCase()}`);
        console.log("Doctors data:", res.data.doctors);
        setDoctors(res.data.doctors || []);

      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, [specialization]);

  return (
    <div className="min-h-screen px-4 py-6 bg-gradient-to-b from-sky-100 to-white">
      <div className="mb-6">
        <Link to="/speciality" className="flex items-center text-blue-700 hover:underline">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Specialities
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-blue-800 mb-6 capitalize">{specialization} Doctors</h1>

      {doctors.length === 0 ? (
        <p className="text-gray-500">No doctors available for this specialization yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl text-black font-semibold mb-2">{doc.fullName}</h3>
              <p className="text-sm text-gray-700">Location: {doc.location}</p>
              <p className="text-sm text-gray-700">Experience: {doc.experience} years</p>
              <p className="text-sm text-gray-700 capitalize">Specialization: {doc.specialization}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecializationDoctors;
