import React, { useRef, useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CgArrowRight, CgArrowLeft } from "react-icons/cg";
import { useAuth } from './authentication/authcontext';
 import '../index.css';
import Doctor from './../assets/doctor1.png';
import AOS from "aos";
import "aos/dist/aos.css";
import aiIcon from '../assets/chatbot.png';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DoctorCard from '../components/DoctorCard';
import SkeletonLoader from '../components/SkeletonLoader';

const API_BASE =  'https://s82-balaji-capstone-careconnect-4.onrender.com';

function Home() {
  const { isLoggedIn, logout } = useAuth();
  const specialref = useRef();
  const contactRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollToContact, setScrollToContact] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigate = useNavigate();
  const [topDoctors, setTopDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
    if (scrollToContact && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
      setScrollToContact(false);
    }
  }, [scrollToContact]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/doctors/top`)
      .then(res => setTopDoctors(res.data))
      .catch(() => setTopDoctors([]))
      .finally(() => setDoctorsLoading(false));
  }, []);

  const specialties = [
    { title: 'Pulmonologist', icon: '🫁', link: '/doctors/pulmonologist' },
    { title: 'Dermatologist', icon: '👨‍⚕️', link: '/doctors/dermatologist' },
    { title: 'Pediatrics', icon: '👶', link: '/doctors/pediatrics' },
    { title: 'Gynecologist', icon: '👩', link: '/doctors/gynecologist' },
    { title: 'Cardiologist', icon: '❤️', link: '/doctors/cardiologist' },
    { title: 'Neurologist', icon: '🧠', link: '/doctors/neurology' },
    { title: 'Orthopedic', icon: '🦴', link: '/doctors/orthopedic' },
    { title: 'ENT Specialist', icon: '👂', link: '/doctors/ent' }
  ];

  const filteredSpecialties = specialties.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpecialisationChange = (e) => {
    if (e.target.value) navigate(`/speciality?type=${e.target.value}`);
  };
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, Math.ceil(filteredSpecialties.length / itemsPerPage) - 1);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Reusable Navbar with mobile hamburger */}
      <Navbar specialRef={specialref} contactRef={contactRef} />

      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] bg-cover bg-center flex items-center bg-[#F8FAFC]"
        style={{
          backgroundImage: "url('https://img.freepik.com/free-photo/blurred-abstract-background-interior-view-looking-out-toward-empty-office-lobby-entrance-doors-glass-curtain-wall-with-frame_1339-6363.jpg?semt=ais_items_boosted&w=740')"
        }}
      >
        <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px]"></div>
        <div
          className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-12 w-full pt-20 pb-12"
          data-aos="fade-up"
        >
          <div className="md:w-[45%] text-center md:text-left text-slate-900 z-20">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide mb-6 shadow-sm border border-indigo-100">
              Trusted Healthcare Platform
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900">
              Find the Right<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Doctor</span>, Anytime,<br />Anywhere!
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0">
              Book appointments with verified specialists instantly. Your health journey starts here with seamless care.
            </p>
            <Link to="/speciality">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-medium hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
                Book an Appointment
              </button>
            </Link>
          </div>

          {/* Composed Doctor Graphic Container */}
          <div className="md:w-[55%] flex justify-center items-center relative mt-16 md:mt-0">
            <div className="relative w-full max-w-[480px] aspect-square flex justify-center items-center">

              {/* Central Background Circle Gradient */}
              <div className="absolute inset-6 md:inset-8 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full z-0 shadow-inner"></div>

              {/* Outer Thin Ring */}
              <div className="absolute inset-0 md:inset-2 border-2 border-blue-500/30 rounded-full z-0 pointer-events-none scale-105"></div>

              {/* Floating Plus Icons */}
              <svg className="absolute top-[10%] left-[0%] w-16 h-16 text-cyan-400 drop-shadow-lg z-10 animate-[pulse_3s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" /></svg>
              <svg className="absolute top-[18%] right-[5%] w-10 h-10 text-cyan-500 drop-shadow-md z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" /></svg>
              <svg className="absolute bottom-[2%] left-[18%] w-12 h-12 text-blue-500 drop-shadow-md z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" /></svg>

              {/* Doctor Image */}
              <img
                className="relative z-10 w-[95%] h-auto max-h-[105%] object-contain object-center drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] transform translate-y-[-3%] translate-x-[-10%] rounded-full"
                src={Doctor}
                alt="Doctor"
              />

              {/* Left Floating Card: 50k+ Customers */}
              <div className="absolute left-[-15%] md:left-[-10%] top-[50%] z-20 bg-white p-4 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex flex-col gap-3 w-[13rem] transition-transform hover:-translate-y-2 duration-300">
                <span className="text-sm font-extrabold text-slate-900 tracking-wide">50k+ Users</span>
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=4" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" alt="user" />
                  <div className="w-10 h-10 rounded-full border-[3px] border-white bg-blue-600 text-white flex items-center justify-center text-sm font-bold z-10 shadow-sm">+</div>
                </div>
              </div>

              {/* Right Floating Card: Connect Doctor */}
              <div className="absolute right-[-10%] md:right-[-5%] bottom-[15%] z-20 bg-white p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex flex-col items-center gap-2 w-40 transition-transform hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-inner mb-2">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                </div>
                <span className="text-[15px] font-extrabold text-slate-900 text-center leading-tight">Connect Doctor</span>
                <span className="text-[10px] text-slate-400 text-center leading-tight">Join meet</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section (Animated) */}
      <section
        ref={specialref}
        className="w-full py-20 bg-white relative overflow-hidden"
        data-aos="fade-up"
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Find Doctors by Speciality</h2>
              <p className="text-slate-500 mt-3 text-lg leading-relaxed">Choose from top specialties tailored to meet your personal health needs with precision and care.</p>
            </div>

            <div className="relative w-full md:w-96 shrink-0 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-12 py-4 rounded-full border border-slate-200 bg-slate-50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-slate-700"
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

          {/* Carousel */}
          <div className="relative px-4 md:px-12">
            {visibleIndex > 0 && (
              <button
                onClick={() => setVisibleIndex((prev) => Math.max(0, prev - 1))}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-indigo-50 text-indigo-600 hover:scale-110 transition-all duration-300 border border-slate-100"
              >
                <CgArrowLeft className="text-2xl" />
              </button>
            )}

            <div className="overflow-hidden py-4">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${visibleIndex * 25}%)`,
                  width: `${filteredSpecialties.length * 25}%`
                }}
              >
                {filteredSpecialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="w-1/4 px-3 md:px-4"
                  >
                    <Link to={specialty.link} className="block group">
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform group-hover:-translate-y-2 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                          {specialty.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{specialty.title}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {visibleIndex < maxIndex && (
              <button
                onClick={() => setVisibleIndex((prev) => Math.min(maxIndex, prev + 1))}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-indigo-50 text-indigo-600 hover:scale-110 transition-all duration-300 border border-slate-100"
              >
                <CgArrowRight className="text-2xl" />
              </button>
            )}
          </div>

          {filteredSpecialties.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 mt-6">
              <p className="text-slate-500 text-lg">No specialties found matching "{searchTerm}".</p>
            </div>
          )}

          <div className="text-center mt-14">
            <Link to="/speciality">
              <button className="px-8 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-semibold rounded-full text-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm">
                Explore All Specialties
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Doctors — fetched from real DB */}
     <section className="w-full py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white border-t border-slate-100" data-aos="fade-up">
  {/* Decorative Background Elements */}
  <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-cyan-50 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
  <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-50 rounded-full blur-[80px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

  <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
    <div className="text-center max-w-2xl mx-auto mb-20" data-aos="fade-down">
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="w-10 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></span>
        <span className="text-sm font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Expert Care</span>
        <span className="w-10 h-[2px] bg-gradient-to-l from-cyan-400 to-blue-500 rounded-full"></span>
      </div>
      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Top Doctors</span>
      </h2>
      <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
        Highly qualified and verified specialists ready to provide you with the best healthcare experience.
      </p>
    </div>

    {doctorsLoading ? (
      <SkeletonLoader count={3} />
    ) : topDoctors.length === 0 ? (
      <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-500 text-lg font-medium">No verified doctors available at the moment.</p>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {topDoctors.map((doctor, i) => (
          <div key={doctor._id} data-aos="zoom-in" data-aos-delay={i * 100} className="group cursor-pointer">
            <div className="transition-all duration-500 group-hover:-translate-y-3">
              <DoctorCard doctor={doctor} />
            </div>
          </div>
        ))}
      </div>
    )}
    
    <div className="text-center mt-20">
      <Link to="/speciality">
        <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full text-lg hover:from-cyan-600 hover:to-blue-700 shadow-xl shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-500/40">
          View All Doctors
        </button>
      </Link>
    </div>
  </div>
</section> 

      <section className="w-full py-24 bg-white relative overflow-hidden" data-aos="fade-up">
        {/* Decorative elements */}
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="bg-white border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-[3rem] p-10 md:p-16 lg:p-20 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 relative overflow-hidden">

            {/* Inner background glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Testimonials */}
            <div className="flex flex-col relative z-10" data-aos="fade-right" data-aos-duration="1000">
  <div className="flex items-center gap-3 mb-4" data-aos="fade-down" data-aos-delay="100">
    <span className="w-8 h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
    <h3 className="text-sm uppercase font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
      Testimonials
    </h3>
  </div>
  <h2
    className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight"
    data-aos="fade-down"
    data-aos-delay="200"
  >
    What People Say
  </h2>
  <div
    className="relative bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-8 md:p-10 rounded-[2rem]"
    data-aos="zoom-in"
    data-aos-delay="300"
    data-aos-duration="800"
  >
    <svg
      className="absolute top-6 left-6 w-10 h-10 text-blue-500/10"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M7.17 6.17C6.39 7.18 6 8.47 6 10H4v4h6v-4c0-2.8-2.2-5-5-5zM17.17 6.17C16.39 7.18 16 8.47 16 10h-2v4h6v-4c0-2.8-2.2-5-5-5z" />
    </svg>
    <p className="text-lg md:text-xl text-slate-600 leading-relaxed pl-12 font-medium italic relative z-10">
      “This platform helped me find the right specialist within minutes. It's user-friendly, reliable, and extremely helpful in critical moments!”
    </p>
    <div
      className="flex items-center mt-8 pl-12"
      data-aos="fade-up"
      data-aos-delay="400"
    >
      <div className="relative">
        <img
          src="https://i.pravatar.cc/100?img=5"
          alt="User Avatar"
          className="w-14 h-14 rounded-full border-[3px] border-white shadow-md object-cover"
        />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
      </div>
      <div className="ml-4">
        <p className="text-lg font-extrabold text-slate-900 tracking-tight">Meera S.</p>
        <p className="text-sm font-medium text-blue-600">Chennai, India</p>
      </div>
    </div>
  </div>
</div>

            {/* Stats */}
            <div className="flex flex-col relative z-10" data-aos="fade-left" data-aos-duration="1000">
              <div className="flex items-center gap-3 mb-4" data-aos="fade-down" data-aos-delay="100">
                <span className="w-8 h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
                <h3 className="text-sm uppercase font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                  Stats
                </h3>
              </div>
              <h2
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-10 tracking-tight"
                data-aos="fade-down"
                data-aos-delay="200"
              >
                Platform at a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { icon: "👨‍⚕️", value: "1.2K+", label: "Doctors Registered" },
                  { icon: "🙌", value: "10K+", label: "Users Helped" },
                  { icon: "🩺", value: "50+", label: "Specialties Covered" },
                  { icon: "⭐", value: "4.9/5", label: "Avg. User Rating" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-5"
                    data-aos="fade-up"
                    data-aos-delay={300 + index * 100}
                    data-aos-duration="800"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm border border-slate-100">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-slate-900 mb-1">{item.value}</p>
                      <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={contactRef} className="w-full bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="md:col-span-5 lg:col-span-4 pr-0 md:pr-8">
            <h1 className="text-3xl font-extrabold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500">Care</span>Connect
            </h1>
            <p className="text-base text-slate-400 leading-relaxed mb-8">
              "Better doctors lead to better outcomes. We connect you with the professionals who truly care."
            </p>
            <form className="flex w-full max-w-md shadow-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 rounded-l-full bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-500"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-r-full font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap border border-blue-600 hover:border-blue-700">
                Subscribe
              </button>
            </form>
          </div>

          <div className="md:col-span-3 lg:col-span-4 lg:justify-self-center">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Our Services</h3>
            <ul className="space-y-3 text-base text-slate-400">
              <li><Link to="/doctors/pulmonologist" className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Pulmonology</Link></li>
              <li><Link to="/doctors/gynecologist" className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Gynecology</Link></li>
              <li><Link to="/doctors/dermatologist" className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Dermatology</Link></li>
              <li><Link to="/doctors/pediatrics" className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Pediatrics</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-4 lg:justify-self-end">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Get in Touch</h3>
            <div className="space-y-4">
              <a href="mailto:careconnect@gmail.com" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-slate-800 group-hover:border-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-base">careconnect@gmail.com</span>
              </a>
              <a href="tel:+916352478570" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-slate-800 group-hover:border-blue-600">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-base">+91 63524 78570</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Care Connect. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* AI Assistant Sticky Icon */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => navigate('/ai-chat')}
          className="relative group text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-all duration-300 transform"
          title="AI Assistant"
        >
          {/* Glowing background ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse opacity-70"></div>

          <img
            className="relative z-10 w-full max-w-xl md:max-w-10xl lg:max-w-4xl rounded-full transform scale-110 object-cover"
            src={aiIcon}
            alt="AI Assistant"
          />

          {/* Popup on Hover */}
          <div className="absolute bottom-20 right-1/2 translate-x-1/2 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 whitespace-nowrap shadow-xl border border-slate-700">
            👋 Hi, I’m Nora!
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-slate-900 border-x-8 border-x-transparent"></div>
          </div>
        </button>
      </div>

    </div>
  );
}

export default Home;