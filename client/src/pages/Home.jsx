import React, { useRef, useState, useEffect } from 'react';
import { Search, Award, Shield, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile,CgArrowRight,CgArrowLeft } from "react-icons/cg";
import { useAuth } from './authentication/authcontext';
import '../app.css';
import '../index.css';
import Doctor from './../assets/doctor.png';
import Logo from './../assets/FullLogo.jpg';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from "aos";
import "aos/dist/aos.css";
import aiIcon from '../assets/chatbot.png';

function Home() {
  const { isLoggedIn, logout } = useAuth();
  const specialref = useRef();
  const contactRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollToContact, setScrollToContact] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigate = useNavigate();



  useEffect(() => {
    AOS.init({
    duration: 1000, // Animation duration in ms
    once: true,     // Whether animation should happen only once
    easing: 'ease-in-out',
  });
    if (scrollToContact && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
      setScrollToContact(false);
    }
  }, [scrollToContact]);

  const specialties = [
    { title: 'Pulmonologist', icon: '🫁', link: '/doctors/pulmonologist' },
    { title: 'Dermatologist', icon: '👨‍⚕️', link: '/doctors/dermatologist' },
    { title: 'Pediatrics', icon: '👶', link: '/doctors/pediatrics' },
    { title: 'Gynecologist', icon: '👩', link: '/doctors/gynecologist' },
    { title: 'Cardiologist', icon: '❤️', link: '/doctors/cardiologist' },
    { title: 'Neurologist', icon: '🧠', link: '/doctors/neurologist' },
    { title: 'Orthopedic', icon: '🦴', link: '/doctors/orthopedic' },
    { title: 'ENT Specialist', icon: '👂', link: '/doctors/ent' }
  ];

  const filteredSpecialties = specialties.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpecialisationChange = (e) => {
    const value = e.target.value;
    if (value) {
      navigate(`/speciality?type=${value}`);
    }
  };
    const itemsPerPage = 4;
const maxIndex = Math.max(0, Math.ceil(filteredSpecialties.length / itemsPerPage) - 1);



  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-sky-100 to-white">
      
      {/* Navbar */}
      {/* Navbar */}
      <nav className="w-full h-20 flex justify-between items-center bg-white px-6 shadow-md sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-4">
          <img src={Logo} alt="Care Connect Logo" className="h-20 w-20 object-contain" />
          <span className="text-2xl md:text-3xl font-bold text-blue-700 tracking-wide">Care Connect</span>
        </Link>

        <div className="flex items-center gap-3 text-sm md:text-base">
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
  >
    Home
  </button>

  <button
    onClick={() => specialref.current?.scrollIntoView({ behavior: 'smooth' })}
    className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
  >
    About
  </button>

  <button
    onClick={() => setScrollToContact(true)}
    className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
  >
    Contact
  </button>

  <select
    onChange={handleSpecialisationChange}
    className="px-4 py-2 rounded-full border border-gray-300 bg-white transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    <option value="">Specialization</option>
    <option value="general">General Physician</option>
    <option value="cardiology">Cardiology</option>
    <option value="neurology">Neurology</option>
    <option value="dermatology">Dermatology</option>
    <option value="orthopedics">Orthopedics</option>
    <option value="pediatrics">Pediatrics</option>
    <option value="psychiatry">Psychiatry</option>
    <option value="ent">ENT</option>
    <option value="gynecology">Gynecology</option>
  </select>

  {isLoggedIn ? (
    <button
      onClick={logout}
      className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
    >
      Logout
    </button>
  ) : (
    <Link to="/login">
      <button className="px-4 py-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition">
        Login
      </button>
    </Link>
  )}

  <Link to="/profile">
    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 transition">
      <CgProfile className="text-2xl text-gray-700 hover:text-blue-700" />
    </button>
  </Link>
</div>

      </nav>

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



{/* Top Doctors */}
<section className="w-full py-16 bg-gray-50" data-aos="fade-up">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2
      className="text-3xl font-bold text-center text-gray-800 mb-12"
      data-aos="fade-down"
      data-aos-duration="800"
    >
      Meet Our Top Doctors
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {[
        {
          name: "Dr. Ananya Sharma",
          specialty: "Dermatologist",
          experience: "8 yrs experience",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          description:
            "Dr. Ananya specializes in treating complex skin conditions and cosmetic dermatology. Known for her compassionate care and modern techniques.",
        },
        {
          name: "Dr. Arjun Patel",
          specialty: "Orthopedic Surgeon",
          experience: "12 yrs experience",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          description:
            "A leading orthopedic expert, Dr. Arjun has performed 1000+ successful joint surgeries. Patients trust him for his precise diagnosis and effective treatment.",
        },
        {
          name: "Dr. Meera Iyer",
          specialty: "Neurologist",
          experience: "10 yrs experience",
          image: "https://randomuser.me/api/portraits/women/65.jpg",
          description:
            "Dr. Meera is known for her research-backed neurological treatments and empathetic approach towards patients with chronic neurological disorders.",
        },
      ].map((doctor, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-8 flex flex-col items-center text-center"
          data-aos="zoom-in"
          data-aos-delay={i * 200}   // Staggered animation
          data-aos-duration="800"
        >
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-24 h-24 rounded-full mb-4 border-4 border-sky-100 shadow-md"
            data-aos="flip-left"
            data-aos-delay={i * 200 + 100}
          />
          <h3
            className="text-xl font-semibold text-gray-900 mb-1"
            data-aos="fade-up"
            data-aos-delay={i * 200 + 150}
          >
            {doctor.name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{doctor.specialty}</p>
          <p className="text-xs text-gray-500 mb-2">{doctor.experience}</p>
          <p className="text-sm text-gray-700 mb-4">{doctor.description}</p>
          <button
            onClick={() => alert('Booking feature coming soon!')}
            className="mt-auto px-5 py-2 bg-sky-600 text-white text-sm rounded-full hover:bg-sky-700 transition"
            data-aos="fade-up"
            data-aos-delay={i * 200 + 200}
          >
            Book Appointment
          </button>
        </div>
      ))}
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
