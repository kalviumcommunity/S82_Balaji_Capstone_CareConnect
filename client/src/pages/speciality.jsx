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
        <Link to="/" className="flex items-center text-blue-700 font-semibold hover:underline">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Search by Speciality</h1>
        <p className="text-gray-600">Choose a speciality to find the best doctors for your needs</p>
      </div>

      {/* Speciality Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
      </div>
    </div>
  );
}

export default SpecialityPage;
