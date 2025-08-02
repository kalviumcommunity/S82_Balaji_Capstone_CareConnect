// pages/SpecializationDoctors.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const SpecializationDoctors = () => {
  const { specialty: specialization } = useParams();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });
    AOS.refresh();
  }, [doctors]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (!specialization) return;
        const res = await axios.get(
          `http://localhost:3000/api/doctors/specialty/${specialization.toLowerCase()}`
        );
        console.log('Doctors data:', res.data.doctors);
        setDoctors(res.data.doctors || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [specialization]);

  return (
    <div className="min-h-screen px-4 py-6 bg-gradient-to-b from-sky-100 to-white">
      {/* Back Link */}
      <div className="mb-6" data-aos="fade-right">
        <Link to="/speciality" className="flex items-center text-blue-700 hover:underline">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Specialities
        </Link>
      </div>

      {/* Page Title */}
      <h1
        className="text-3xl font-bold text-blue-800 mb-6 capitalize"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {specialization} Doctors
      </h1>

      {/* Doctor List */}
      {doctors.length === 0 ? (
        <p className="text-gray-500" data-aos="fade-in">
          No doctors available for this specialization yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {doctors.map((doc, index) => (
            <div
              key={doc._id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:scale-105"
              data-aos="zoom-in-up"
              data-aos-delay={index * 100} // staggered
            >
              <h3 className="text-xl text-black font-semibold mb-2">{doc.fullName}</h3>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Location:</span> {doc.location}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Experience:</span> {doc.experience} years
              </p>
              <p className="text-sm text-gray-700 capitalize">
                <span className="font-medium">Specialization:</span> {doc.specialization}
              </p>

              {/* Book Button */}
              <Link
                to={`/book/${doc._id}`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecializationDoctors;
