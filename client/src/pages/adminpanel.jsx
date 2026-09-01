import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from './authentication/authcontext';
import { CheckCircle, XCircle, Shield, User, MapPin, Briefcase, FileText, RefreshCw, LogOut, Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const ADMIN_ROUTE = '/api/admin';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDoctors();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ADMIN_ROUTE}/doctors`);
      setDoctors(res.data.data || res.data);
    } catch (err) {
      showToast('Failed to load doctors. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId) => {
    setActionLoading(doctorId + '_verify');
    try {
      await api.patch(`${ADMIN_ROUTE}/verify/${doctorId}`);
      setDoctors(prev => prev.map(d => d._id === doctorId ? { ...d, isVerified: true, rejectionReason: null } : d));
      showToast('✅ Doctor verified successfully!');
    } catch {
      showToast('❌ Failed to verify doctor');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (doctorId) => {
    const reason = prompt('Enter rejection reason (optional):') || 'Certificate not valid';
    setActionLoading(doctorId + '_reject');
    try {
      await api.patch(`${ADMIN_ROUTE}/reject/${doctorId}`, { reason });
      setDoctors(prev => prev.map(d => d._id === doctorId ? { ...d, isVerified: false, rejectionReason: reason } : d));
      showToast('Doctor rejected.');
    } catch {
      showToast('❌ Failed to reject doctor');
    } finally {
      setActionLoading('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = doctors.filter(d => {
    if (filter === 'pending') return !d.isVerified;
    if (filter === 'verified') return d.isVerified;
    return true;
  });

  const pendingCount = doctors.filter(d => !d.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800">
      {/* Subtle modern background decorative shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CareConnect Command</h1>
              <p className="text-slate-500 text-xs font-medium">Administrator Verification Matrix</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDoctors} 
              className="flex items-center gap-2 text-sm bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200/80 transition-all duration-200 active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} /> 
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium px-4 py-2.5 rounded-xl border border-rose-100 transition-all duration-200 active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full blur-xl group-hover:bg-blue-100 transition-all"></div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
              <Users size={26} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{doctors.length}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Total Doctors</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full blur-xl group-hover:bg-amber-100 transition-all"></div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100 shadow-inner">
              <Clock size={26} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-600 tracking-tight">{pendingCount}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Pending Verification</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100 transition-all"></div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{doctors.length - pendingCount}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Verified Doctors</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/80 w-fit shadow-md shadow-slate-200/50">
          {[
            { key: 'all', label: `All (${doctors.length})` },
            { key: 'pending', label: `⏳ Pending (${pendingCount})` },
            { key: 'verified', label: `✅ Verified (${doctors.length - pendingCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Doctors List */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-52 bg-white/60 animate-pulse rounded-3xl border border-slate-200/80 shadow-sm" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <User className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-slate-600 font-medium">No doctors found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((doctor) => {
              const isVerifyingThis = actionLoading === doctor._id + '_verify';
              const isRejectingThis = actionLoading === doctor._id + '_reject';
              const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';
              return (
                <div 
                  key={doctor._id} 
                  className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative overflow-hidden group ${
                    doctor.isVerified ? 'border-l-8 border-l-emerald-500' : 'border-l-8 border-l-amber-500'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={doctor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || 'D')}&background=2563eb&color=fff&size=56`}
                          alt={doctor.fullName}
                          className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-blue-500/20"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{doctor.fullName}</h3>
                          <p className="text-sm font-semibold text-blue-600 capitalize">{doctor.specialization}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{doctor.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                        doctor.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {doctor.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium mb-4">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{doctor.experience} yrs exp</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{doctor.location || 'N/A'}</span>
                      </div>
                      {doctor.consultationFee && (
                        <div className="text-emerald-700 font-semibold">
                          ₹{doctor.consultationFee}
                        </div>
                      )}
                      <div className="text-slate-400">
                        Joined: {new Date(doctor.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {doctor.certificateUrl && (
                      <a
                        href={`${API_BASE}/${doctor.certificateUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-100/60 px-3.5 py-2 rounded-xl border border-blue-100 mb-4 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> <span>View Professional Certificate</span>
                      </a>
                    )}

                    {!doctor.isVerified && doctor.rejectionReason && (
                      <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl mb-4 text-xs text-rose-700 font-medium">
                        <span className="font-bold text-rose-800">Last Rejection Reason:</span> {doctor.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleVerify(doctor._id)}
                      disabled={!!actionLoading || doctor.isVerified}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isVerifyingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>{isVerifyingThis ? 'Verifying...' : 'Verify Doctor'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white rounded-2xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isRejectingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      <span>{isRejectingThis ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-6 py-3.5 rounded-2xl shadow-2xl z-50 animate-bounce border border-slate-800">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;