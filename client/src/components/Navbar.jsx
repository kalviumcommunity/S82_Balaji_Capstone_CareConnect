import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { useAuth } from '../pages/authentication/authcontext';
import Logo from '../assets/FullLogo.jpg';
import { ChevronDown, LogOut, User, Menu, X, Stethoscope } from 'lucide-react';

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
    <nav className="w-full h-20 flex justify-between items-center bg-white/80 backdrop-blur-xl px-6 sm:px-10 shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="relative">
          <img src={Logo} alt="Care Connect Logo" className="h-12 w-12 object-contain rounded-xl shadow-md border border-slate-100 transition-transform group-hover:scale-105" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Care <span className="text-blue-600">Connect</span></span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-4 py-2 rounded-xl transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          Home
        </button>
        <button
          onClick={() => scrollTo(specialRef)}
          className="px-4 py-2 rounded-xl transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          About
        </button>
        <button
          onClick={() => scrollTo(contactRef)}
          className="px-4 py-2 rounded-xl transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          Contact
        </button>
        <div className="relative">
          <select
            onChange={handleSpecialisationChange}
            className="px-4 py-2 pr-9 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all duration-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 appearance-none cursor-pointer shadow-inner"
          >
            {specializations.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3 ml-2">
            <Link to="/profile">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/60 shadow-sm transition-all active:scale-95">
                <CgProfile className="text-xl" />
              </button>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium border border-rose-100 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="ml-2">
            <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-slate-200 z-40 flex flex-col p-6 gap-3 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }} className="text-left py-2.5 px-4 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition-colors">Home</button>
          <button onClick={() => scrollTo(specialRef)} className="text-left py-2.5 px-4 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition-colors">About</button>
          <button onClick={() => scrollTo(contactRef)} className="text-left py-2.5 px-4 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition-colors">Contact</button>
          <Link to="/speciality" onClick={() => setMenuOpen(false)} className="py-2.5 px-4 rounded-xl hover:bg-blue-50 font-medium text-blue-600 transition-colors">Browse Doctors</Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-3 px-4 rounded-xl bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800"><CgProfile className="text-xl text-blue-600" /> Profile</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="py-3 px-4 rounded-xl bg-rose-50 text-rose-600 font-medium text-left flex items-center gap-2"><LogOut size={16} /> Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-center bg-blue-600 text-white rounded-xl font-medium shadow-md shadow-blue-500/20">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;