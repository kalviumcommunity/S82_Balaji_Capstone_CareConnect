import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, BadgeCheck, Trash2, X, Star, Clock, Banknote, Phone, Calendar, SearchX, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';
function DoctorsPage() {
  const { specialty } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/doctors/specialty/${specialty}`);      
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    } 
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/api/patients/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(res.data.user);
      } catch (err) {
        console.log('Profile fetch error:', err);
      }
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchProfile();
  }, [specialty]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteMessage("Doctor deleted successfully ✅");

      setTimeout(() => {
        setDeleteMessage("");
      }, 2000);

      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete doctor', err);
      setDeleteMessage("Failed to delete doctor ❌");

      setTimeout(() => {
        setDeleteMessage("");
      }, 2000);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.specialization.toLowerCase().replace(/\s+/g, '') ===
      specialty?.toLowerCase().replace(/\s+/g, '')
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-cyan-100/40 to-blue-200/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-indigo-100/40 to-sky-100/30 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      {/* Back Link */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <Link 
          to="/speciality" 
          className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-all bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow group"
        >
          <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Speciality
        </Link>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2.5 mb-3 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Verified Specialists</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 capitalize tracking-tight">
            {specialty} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Doctors</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg mt-3 max-w-2xl font-medium">
            Browse highly qualified specialists available for your personal care and seamless online booking.
          </p>
        </div>

        {deleteMessage && (
          <div className="max-w-md mx-auto mb-8 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-center font-semibold shadow-sm transition-all duration-500">
            {deleteMessage}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-pulse h-80"></div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-xl shadow-slate-100 border border-slate-200/60 max-w-xl mx-auto my-12">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner border border-indigo-100/60">
              <SearchX className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Doctors Found</h3>
            <p className="text-slate-500 text-base font-medium mb-6">
              No doctors found for {specialty}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setShowModal(true);
                }}
                className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 via-indigo-50/20 to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <img
                      src={doctor.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                      alt={doctor.fullName}
                      className="w-16 h-16 rounded-2xl object-cover shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform border border-white"
                    />
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Verified
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {doctor.fullName}
                  </h3>
                  <p className="text-sm font-semibold text-indigo-600 capitalize mb-6">{doctor.specialization}</p>

                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-center gap-3.5 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-semibold text-slate-700">{doctor.experience} experience</span>
                    </div>

                    <div className="flex items-center gap-3.5 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                      </div>
                      <span className="font-semibold text-slate-700 truncate">{doctor.location}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-slate-100/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View Profile &rarr;
                  </span>
                  {currentUser?.role === 'doctor' && currentUser?.doctor?._id === doctor._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doctor._id);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[2.5rem] w-full max-w-lg relative shadow-2xl border border-slate-100 overflow-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <img
                src={selectedDoctor.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                alt={selectedDoctor.fullName}
                className="w-28 h-28 rounded-3xl mx-auto mb-4 object-cover shadow-lg border-2 border-indigo-100"
              />
              <h2 className="text-2xl font-bold text-slate-900">{selectedDoctor.fullName}</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">{selectedDoctor.title}</p>
              <p className="text-sm text-indigo-600 font-semibold mb-2">{selectedDoctor.specialization || "Lecturer of dermatology"}</p>

              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-200/60 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedDoctor.rating || 4.5}</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 border border-slate-100 text-center">
              <p className="font-bold text-slate-900 mb-1">{selectedDoctor.clinicName || "Samir Shehata Mohamed Clinic"}</p>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">{selectedDoctor.city || "Assiut City"}:</strong> {selectedDoctor.address || "Yousry Rageb Street, Above Al Araby Juice"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="bg-indigo-50/60 border border-indigo-100/60 p-3 rounded-2xl">
                <Clock className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 block">Waiting Time</span>
                <span className="text-xs text-indigo-600 font-semibold">{selectedDoctor.waitingTime || "10 minutes"}</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100/60 p-3 rounded-2xl">
                <Banknote className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 block">Fee</span>
                <span className="text-xs text-emerald-600 font-semibold">{selectedDoctor.fee ? `${selectedDoctor.fee} EGP` : "650 EGP"}</span>
              </div>
              <div className="bg-cyan-50/60 border border-cyan-100/60 p-3 rounded-2xl">
                <Phone className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 block">Phone</span>
                <span className="text-xs text-cyan-600 font-semibold truncate block">{selectedDoctor.phone || "01201111344"}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-4 font-medium">First In First Out</p>

            <div className="text-center pt-2">
              <Link
                to={`/book/${selectedDoctor._id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default DoctorsPage;