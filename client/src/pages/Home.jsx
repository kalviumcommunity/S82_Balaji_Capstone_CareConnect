import React, { useRef, useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CgArrowRight, CgArrowLeft } from "react-icons/cg";
import { useAuth } from './authentication/authcontext';
import '../app.css';
import '../index.css';
import Doctor from './../assets/doctor.png';
import AOS from "aos";
import "aos/dist/aos.css";
import aiIcon from '../assets/chatbot.png';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DoctorCard from '../components/DoctorCard';
import SkeletonLoader from '../components/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

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
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-sky-100 to-white">
      {/* Reusable Navbar with mobile hamburger */}
      <Navbar specialRef={specialref} contactRef={contactRef} />

      {/* Hero Section */}
      <section
  className="relative min-h-[80vh] bg-cover bg-center flex items-center"
  style={{
    backgroundImage: "url('https://img.freepik.com/free-photo/blurred-abstract-background-interior-view-looking-out-toward-empty-office-lobby-entrance-doors-glass-curtain-wall-with-frame_1339-6363.jpg?semt=ais_items_boosted&w=740')"
  }}
>
  <div className="absolute inset-0 bg-opacity-60 backdrop-blur-sm"></div>
  <div
    className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 w-full pt-12 pb-4"
    data-aos="fade-up"
  >
    <div className="md:w-1/2 text-center md:text-left text-gray-900">
      <h2 className="text-5xl font-bold mb-6 leading-tight">
        Find the Right<br />Doctor, Anytime,<br />Anywhere!
      </h2>
      <Link to="/speciality">
        <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700">
          Book Now
        </button>
      </Link>
    </div>
    <img
      className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-lg"
      src={Doctor}
      alt="Doctor"
      
    />
  </div>
</section>


      {/* Specialties Section */}


{/* Specialties Section (Animated) */}
 <section
        ref={specialref}
        className="w-full py-16 bg-gradient-to-b from-white to-sky-50"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Find Doctors by Speciality</h2>
              <p className="text-gray-500 mt-1">Choose from top specialties tailored for your health needs.</p>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            {visibleIndex > 0 && (
              <button
                onClick={() => setVisibleIndex((prev) => Math.max(0, prev - 1))}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow hover:bg-gray-100"
              >
                <CgArrowLeft className="text-xl" />
              </button>
            )}

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${visibleIndex * 25}%)`,
                  width: `${filteredSpecialties.length * 25}%`
                }}
              >
                {filteredSpecialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="w-1/4 px-3"
                  >
                    <Link to={specialty.link}>
                      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition transform hover:scale-105 p-6 text-center">
                        <div className="text-4xl mb-3">{specialty.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-800">{specialty.title}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {visibleIndex < maxIndex && (
              <button
                onClick={() => setVisibleIndex((prev) => Math.min(maxIndex, prev + 1))}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow hover:bg-gray-100"
              >
                <CgArrowRight className="text-xl" />
              </button>
            )}
          </div>

          {filteredSpecialties.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No specialties found.</p>
          )}

          <div className="text-center mt-10">
            <Link to="/speciality">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 shadow-lg">
                View All Specialties
              </button>
            </Link>
          </div>
        </div>
      </section>



{/* Top Doctors — fetched from real DB */}
<section className="w-full py-16 bg-gray-50" data-aos="fade-up">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4" data-aos="fade-down">
      Meet Our Top Doctors
    </h2>
    <p className="text-center text-gray-500 mb-10">Verified specialists ready to help you</p>
    {doctorsLoading ? (
      <SkeletonLoader count={3} />
    ) : topDoctors.length === 0 ? (
      <p className="text-center text-gray-400 py-8">No verified doctors available yet.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {topDoctors.map((doctor, i) => (
          <div key={doctor._id} data-aos="zoom-in" data-aos-delay={i * 150}>
            <DoctorCard doctor={doctor} />
          </div>
        ))}
      </div>
    )}
    <div className="text-center mt-10">
      <Link to="/speciality">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 shadow-lg">
          View All Doctors
        </button>
      </Link>
    </div>
  </div>
</section>




<section className="w-full py-20 bg-gray-50" data-aos="fade-up">
  <div className="max-w-7xl mx-auto px-6">
    <div className="bg-white shadow-2xl rounded-3xl p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-12">
      
      {/* Testimonials */}
      <div className="flex flex-col" data-aos="fade-right" data-aos-duration="1000">
        <h3
          className="text-sm uppercase text-sky-600 font-semibold tracking-wider mb-2"
          data-aos="fade-down"
          data-aos-delay="100"
        >
          Testimonials
        </h3>
        <h2
          className="text-3xl font-bold text-gray-900 mb-6"
          data-aos="fade-down"
          data-aos-delay="200"
        >
          What People Say
        </h2>
        <div
          className="relative bg-gray-100 p-6 rounded-xl shadow-sm"
          data-aos="zoom-in"
          data-aos-delay="300"
          data-aos-duration="800"
        >
          <svg
            className="absolute top-4 left-4 w-6 h-6 text-sky-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7.17 6.17C6.39 7.18 6 8.47 6 10H4v4h6v-4c0-2.8-2.2-5-5-5zM17.17 6.17C16.39 7.18 16 8.47 16 10h-2v4h6v-4c0-2.8-2.2-5-5-5z" />
          </svg>
          <p className="text-base text-gray-700 leading-relaxed pl-10">
            “This platform helped me find the right specialist within minutes. It's user-friendly, reliable, and extremely helpful!”
          </p>
          <div
            className="flex items-center mt-6"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <img
              src="https://i.pravatar.cc/40?img=5"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-sky-500"
            />
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800">Meera S.</p>
              <p className="text-xs text-gray-500">Chennai, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col" data-aos="fade-left" data-aos-duration="1000">
        <h3
          className="text-sm uppercase text-sky-600 font-semibold tracking-wider mb-2"
          data-aos="fade-down"
          data-aos-delay="100"
        >
          Stats
        </h3>
        <h2
          className="text-3xl font-bold text-gray-900 mb-6"
          data-aos="fade-down"
          data-aos-delay="200"
        >
          Platform at a Glance
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
          {[
            { icon: "👨‍⚕️", value: "1.2K+", label: "Doctors Registered" },
            { icon: "🙌", value: "10K+", label: "Users Helped" },
            { icon: "🩺", value: "50+", label: "Specialties Covered" },
            { icon: "⭐", value: "4.9/5", label: "Avg. User Rating" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4"
              data-aos="flip-up"
              data-aos-delay={300 + index * 150} // Staggered effect
              data-aos-duration="800"
            >
              <div className="text-sky-600 text-3xl">{item.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>





      {/* Footer */}
      <footer ref={contactRef} className="w-full bg-blue-400 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h1 className="text-2xl font-semibold mb-4">Care Connect</h1>
            <p className="text-sm opacity-80 mb-4">"Better doctors lead better outcomes. Others hold your hand."</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-l-full text-black focus:outline-none"
              />
              <button className="px-4 py-2 bg-white text-blue-600 rounded-r-full font-semibold hover:bg-gray-100">
                Subscribe
              </button>
            </form>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Our services</h3>
            <ul className="space-y-2 text-sm">
              <li>Pulmonology</li>
              <li>Gynecology</li>
              <li>Dermatology</li>
              <li>Pediatrics</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5" />
              <span>careconnect@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+91 63524 78570</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant Sticky Icon */}
<div className="fixed bottom-6 right-6 z-50">
  <button
  onClick={() => navigate('/ai-chat')}
  className="relative group text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition transform"
  title="AI Assistant"
>
  {/* Doctor Icon shifted further left */}
  <img
    className="w-full max-w-xl md:max-w-10xl lg:max-w-4xl rounded-lg transform scale-110 -ml-3"
    src={aiIcon}
    alt="Doctor"
  />

  {/* Popup on Hover */}
  <div className="absolute bottom-16 right-1/2 translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 whitespace-nowrap shadow-lg">
    👋 Hi, I’m Nora!
    {/* Tooltip Arrow */}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-gray-900 border-x-8 border-x-transparent"></div>
  </div>
</button>


</div>

    </div>
  );
}

export default Home;
