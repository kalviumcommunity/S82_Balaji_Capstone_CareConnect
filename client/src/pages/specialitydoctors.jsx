// pages/SpecializationDoctors.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Award, Stethoscope, Calendar, SearchX, ShieldCheck } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

const SpecializationDoctors = () => {
  const { specialty: specialization } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });
    AOS.refresh();
  }, [doctors]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (!specialization) return;
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/doctors/specialty/${specialization.toLowerCase()}`
        );
        console.log('Doctors data:', res.data.doctors);
        setDoctors(res.data.doctors || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specialization]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-cyan-100/40 to-blue-200/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-indigo-100/40 to-sky-100/30 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      {/* Back Link */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10" data-aos="fade-right">
        <Link 
          to="/speciality" 
          className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-all bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow group"
        >
          <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Specialities
        </Link>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page Title Header */}
        <div className="mb-12 text-center md:text-left" data-aos="fade-up" data-aos-delay="100">
          <div className="inline-flex items-center gap-2.5 mb-3 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Verified Specialists</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 capitalize tracking-tight">
            {specialization} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Doctors</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg mt-3 max-w-2xl font-medium">
            Browse highly qualified specialists available for your personal care and seamless online booking.
          </p>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-pulse h-80"></div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-xl shadow-slate-100 border border-slate-200/60 max-w-xl mx-auto my-12" data-aos="fade-in">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner border border-indigo-100/60">
              <SearchX className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Doctors Found</h3>
            <p className="text-slate-500 text-base font-medium">
              No doctors available for this specialization yet. Please check back later or explore other specialties.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {doctors.map((doc, index) => (
              <div
                key={doc._id}
                className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group"
                data-aos="zoom-in-up"
                data-aos-delay={index * 100}
              >
                {/* Accent Hover Gradient Header Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 via-indigo-50/20 to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10">
                  {/* Doctor Avatar & Verified Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      {doc.fullName ? doc.fullName.charAt(0) : 'D'}
                    </div>
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Verified
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-5 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {doc.fullName}
                  </h3>

                  {/* Info Meta Grid */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-center gap-3.5 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                      </div>
                      <span className="font-semibold text-slate-700 truncate">{doc.location || 'Location not specified'}</span>
                    </div>

                    <div className="flex items-center gap-3.5 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
                        <Award className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-semibold text-slate-700">{doc.experience} Years Experience</span>
                    </div>

                    <div className="flex items-center gap-3.5 text-sm text-slate-600 capitalize">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
                        <Stethoscope className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="font-semibold text-slate-700">{doc.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <div className="relative z-10 pt-4 border-t border-slate-100/80">
                  <Link
                    to={`/book/${doc._id}`}
                    className="w-full text-center inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:opacity-95 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-[1.02]"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecializationDoctors;