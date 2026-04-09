import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Shield, User, Star, MapPin, Briefcase, FileText, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';
const ADMIN_ROUTE = '/api/cc-admin-9x7z';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'verified'
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');
  const token = localStorage.getItem('token');

  // Guard: redirect if not admin
  useEffect(() => {
    try {
      if (!token) { navigate('/login'); return; }
      
      // Fix for base64 decoding issues (add padding if needed)
      let base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) throw new Error('InvalidLengthError: Input base64url string length is invalid.');
        base64 += new Array(5 - pad).join('=');
      }
      
      const payload = JSON.parse(atob(base64));
      if (payload.role !== 'admin') { navigate('/'); return; }
    } catch (e) {
      console.error("Admin Auth Error:", e);
      navigate('/login');
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
      const res = await axios.get(`${API_BASE}${ADMIN_ROUTE}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      alert('Failed to load doctors. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId) => {
    setActionLoading(doctorId + '_verify');
    try {
      await axios.patch(`${API_BASE}${ADMIN_ROUTE}/verify/${doctorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await axios.patch(`${API_BASE}${ADMIN_ROUTE}/reject/${doctorId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(prev => prev.map(d => d._id === doctorId ? { ...d, isVerified: false, rejectionReason: reason } : d));
      showToast('Doctor rejected.');
    } catch {
      showToast('❌ Failed to reject doctor');
    } finally {
      setActionLoading('');
    }
  };

  const filtered = doctors.filter(d => {
    if (filter === 'pending') return !d.isVerified;
    if (filter === 'verified') return d.isVerified;
    return true;
  });

  const pendingCount = doctors.filter(d => !d.isVerified).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7" />
            <div>
              <h1 className="text-2xl font-bold">CareConnect Admin Panel</h1>
              <p className="text-blue-200 text-sm">Doctor Verification Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDoctors} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="text-sm bg-red-500/80 hover:bg-red-600 px-3 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center border-l-4 border-blue-500">
            <p className="text-3xl font-bold text-blue-700">{doctors.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Doctors</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center border-l-4 border-yellow-400">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Verification</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center border-l-4 border-green-500">
            <p className="text-3xl font-bold text-green-600">{doctors.length - pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Verified Doctors</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: `All (${doctors.length})` },
            { key: 'pending', label: `⏳ Pending (${pendingCount})` },
            { key: 'verified', label: `✅ Verified (${doctors.length - pendingCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === tab.key
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Doctors List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-white animate-pulse rounded-2xl shadow-sm" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No doctors in this category.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((doctor) => {
              const isVerifyingThis = actionLoading === doctor._id + '_verify';
              const isRejectingThis = actionLoading === doctor._id + '_reject';
              return (
                <div key={doctor._id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${doctor.isVerified ? 'border-green-400' : 'border-yellow-400'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={doctor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || 'D')}&background=2563eb&color=fff&size=48`}
                        alt={doctor.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{doctor.fullName}</h3>
                        <p className="text-sm text-blue-600 capitalize">{doctor.specialization}</p>
                        <p className="text-xs text-gray-400">{doctor.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doctor.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {doctor.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{doctor.experience} yrs</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.location}</span>
                    {doctor.consultationFee && <span>₹{doctor.consultationFee}</span>}
                    <span>Joined: {new Date(doctor.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Certificate link */}
                  {doctor.certificateUrl && (
                    <a
                      href={`${API_BASE}/${doctor.certificateUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 flex items-center gap-1 mb-3 hover:underline"
                    >
                      <FileText className="w-3 h-3" /> View Certificate
                    </a>
                  )}

                  {/* Rejection reason */}
                  {!doctor.isVerified && doctor.rejectionReason && (
                    <p className="text-xs text-red-500 mb-2 italic">Last rejection: {doctor.rejectionReason}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(doctor._id)}
                      disabled={!!actionLoading || doctor.isVerified}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifyingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {isVerifyingThis ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRejectingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      {isRejectingThis ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
