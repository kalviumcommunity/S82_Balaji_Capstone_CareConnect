import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { useAuth } from '../pages/authentication/authcontext';
import Logo from '../assets/FullLogo.jpg';

const specializations = [
  { value: '', label: 'Specialization' },
  { value: 'general', label: 'General Physician' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ent', label: 'ENT' },
  { value: 'gynecology', label: 'Gynecology' },
];

function Navbar({ specialRef, contactRef }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSpecialisationChange = (e) => {
    if (e.target.value) navigate(`/speciality?type=${e.target.value}`);
  };

  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className="w-full h-20 flex justify-between items-center bg-white px-6 shadow-md sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-3">
        <img src={Logo} alt="Care Connect Logo" className="h-16 w-16 object-contain" />
        <span className="text-2xl font-bold text-blue-700 tracking-wide">Care Connect</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-3 text-sm">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
        >
          Home
        </button>
        <button
          onClick={() => scrollTo(specialRef)}
          className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
        >
          About
        </button>
        <button
          onClick={() => scrollTo(contactRef)}
          className="px-4 py-2 rounded-full transition hover:bg-blue-100 hover:text-blue-700"
        >
          Contact
        </button>
        <select
          onChange={handleSpecialisationChange}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {specializations.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {isLoggedIn ? (
          <>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
            <Link to="/profile">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 transition">
                <CgProfile className="text-2xl text-gray-700 hover:text-blue-700" />
              </button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <button className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white shadow-lg border-t z-40 flex flex-col p-4 gap-3 md:hidden">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }} className="text-left py-2 hover:text-blue-600">Home</button>
          <button onClick={() => scrollTo(specialRef)} className="text-left py-2 hover:text-blue-600">About</button>
          <button onClick={() => scrollTo(contactRef)} className="text-left py-2 hover:text-blue-600">Contact</button>
          <Link to="/speciality" onClick={() => setMenuOpen(false)} className="py-2 text-blue-600">Browse Doctors</Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 flex items-center gap-2"><CgProfile className="text-xl" /> Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="py-2 text-red-500 text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-blue-600">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
