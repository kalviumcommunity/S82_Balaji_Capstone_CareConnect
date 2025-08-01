<<<<<<< HEAD
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const specialties = [
  { title: 'Pulmonologist', icon: '🫁',link:'/doctors/pulmonologist' },
  { title: 'Dermatologist', icon: '👨‍⚕️', link: '/doctors/dermatologist' }, // 🔗 Linked
  { title: 'Pediatrics', icon: '👶' ,link:'/doctors/pediatrics'},
  { title: 'Gynecologist', icon: '👩‍⚕️' ,link:'/doctors/gynecologist'},
  { title: 'Cardiologist', icon: '❤️' ,link:'/doctors/cardiologist'},
  { title: 'Neurologist', icon: '🧠' ,link:'/doctors/neurologist'},
  { title: 'Orthopedic', icon: '🦴' ,link:'/doctors/orthopedic'},
  { title: 'ENT Specialist', icon: '👂' ,link:'/doctors/ent'},
  { title: 'Psychatrist' , icon:'👨‍🔬' , link:'/doctors/psychatrist'},
  { title: 'General Physician' , icon:'👨‍🔬' , link:'/doctors/general'}
];

function SpecialityPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-white px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center mb-6">
=======
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const specialties = [
  { title: 'Pulmonologist', icon: '🫁', link: '/doctors/pulmonologist' },
  { title: 'Dermatologist', icon: '👨‍⚕️', link: '/doctors/dermatologist' },
  { title: 'Pediatrics', icon: '👶', link: '/doctors/pediatrics' },
  { title: 'Gynecologist', icon: '👩‍⚕️', link: '/doctors/gynecologist' },
  { title: 'Cardiologist', icon: '❤️', link: '/doctors/cardiologist' },
  { title: 'Neurologist', icon: '🧠', link: '/doctors/neurologist' },
  { title: 'Orthopedic', icon: '🦴', link: '/doctors/orthopedic' },
  { title: 'ENT Specialist', icon: '👂', link: '/doctors/ent' },
  { title: 'Psychatrist', icon: '👨‍🔬', link: '/doctors/psychatrist' },
  { title: 'General Physician', icon: '👨‍🔬', link: '/doctors/general' }
];

function SpecialityPage() {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });
  }, []);

  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-white px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6" data-aos="fade-down">
>>>>>>> AI-chatbot
        <Link to="/" className="flex items-center text-blue-700 font-semibold hover:underline">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
      </div>

      {/* Title */}
<<<<<<< HEAD
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Search by Speciality</h1>
        <p className="text-gray-600">Choose a speciality to find the best doctors for your needs</p>
=======
      <div className="text-center mb-8" data-aos="fade-up">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Search by Speciality</h1>
        <p className="text-gray-600">
          Choose a speciality or search to find the right doctor for your needs.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex justify-center mb-10" data-aos="zoom-in">
        <input
          type="text"
          placeholder="Search by speciality..."
          className="w-full sm:w-1/2 px-4 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
>>>>>>> AI-chatbot
      </div>

      {/* Speciality Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
<<<<<<< HEAD
        {specialties.map((specialty, index) => {
          const content = (
            <div
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition duration-300 text-center cursor-pointer"
            >
              <div className="text-4xl mb-3">{specialty.icon}</div>
              <h3 className="text-lg font-medium text-gray-800">{specialty.title}</h3>
            </div>
          );

          return specialty.link ? (
            <Link to={specialty.link} key={index}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
=======
        {filteredSpecialties.length > 0 ? (
          filteredSpecialties.map((specialty, index) => {
            const content = (
              <div
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transform hover:scale-105 transition duration-300 text-center cursor-pointer"
                data-aos="flip-up"
                data-aos-delay={index * 100} // staggered animation
              >
                <div className="text-4xl mb-3">{specialty.icon}</div>
                <h3 className="text-lg font-medium text-gray-800">{specialty.title}</h3>
              </div>
            );

            return specialty.link ? (
              <Link to={specialty.link} key={index}>
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            );
          })
        ) : (
          <div className="text-center col-span-full text-gray-600" data-aos="fade-in">
            No results found for "<strong>{searchTerm}</strong>"
          </div>
        )}
>>>>>>> AI-chatbot
      </div>
    </div>
  );
}

export default SpecialityPage;
