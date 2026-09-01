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
  { title: 'Neurologist', icon: '🧠', link: '/doctors/neurology' },
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
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center mb-6" data-aos="fade-down">
        <Link to="/" className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
      </div>

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10" data-aos="fade-up">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></span>
          <span className="text-sm font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Expert Care</span>
          <span className="w-8 h-[2px] bg-gradient-to-l from-cyan-400 to-blue-500 rounded-full"></span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Search by Speciality</h1>
        <p className="text-slate-500 text-lg">
          Choose a speciality or search to find the right doctor for your needs.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex justify-center mb-14" data-aos="zoom-in">
        <div className="relative w-full sm:w-1/2 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by speciality..."
            className="w-full pl-11 pr-12 py-4 rounded-full border border-slate-200 bg-white shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors"
            >
              <span className="text-xs font-bold">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Speciality Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto pb-16">
        {filteredSpecialties.length > 0 ? (
          filteredSpecialties.map((specialty, index) => {
            const content = (
              <div
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2 p-8 text-center relative overflow-hidden group h-full flex flex-col items-center justify-center"
                data-aos="flip-up"
                data-aos-delay={index * 100}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10">
                  {specialty.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors relative z-10">{specialty.title}</h3>
              </div>
            );

            return specialty.link ? (
              <Link to={specialty.link} key={index} className="block">
                {content}
              </Link>
            ) : (
              <div key={index} className="block">{content}</div>
            );
          })
        ) : (
          <div className="text-center col-span-full py-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500 text-lg" data-aos="fade-in">
            No results found for "<strong>{searchTerm}</strong>"
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecialityPage;