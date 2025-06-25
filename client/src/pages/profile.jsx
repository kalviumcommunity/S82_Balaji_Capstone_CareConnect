import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingIcons from 'react-loading-icons'
import load from '../assets/Animation - 1750351638911.gif'

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/patientprofile/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials:true
        });
        console.log("Profile API response:", res.data);

        setUser(res.data.user);
      } catch (err) {
        console.error("Profile fetch error:", err?.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center h-screen text-blue-600">
      {/* <LoadingIcons.Bars stroke="#3B82F6" height={50} /> */}
      <img src={load} alt="Loading..." className="w-40 h-40 mb-4" />
      <p className="text-blue-600 text-lg font-semibold">Loading profile...</p>
    </div>
  );


  console.log(user);
  if (!user)
    return (
      <div className="text-center p-10 text-red-600">
        <p>User not logged in or failed to load profile.</p>
        <Link to="/login" className="text-blue-600 underline">Login</Link>
      </div>
    );
    
  return (
    <div className="min-h-screen bg-gradient-to-b w-full from-blue-100 to-white p-8">
      <Link to="/" className="text-blue-700 flex items-center mb-6 hover:underline">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <div className="bg-white shadow-xl rounded-xl p-6 max-w-3xl mx-auto">
        

        {user.role === "doctor" && (
  <div className="flex flex-col items-center text-center">
    <img
      src={user.doctor.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
      alt={user.doctor.fullName}
      className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-blue-300"
    />

    <h1 className="text-3xl font-bold mb-2">{user.doctor.fullName}</h1>
    <p className="text-sm text-gray-600 mb-4">Role: {user.role || "N/A"}</p>

    <div className="w-full max-w-md text-left space-y-2">
      <p><strong>Email:</strong> {user.doctor.email}</p>
      <p><strong>Specialization:</strong> {user.doctor.specialization}</p>
      <p><strong>Experience:</strong> {user.doctor.experience} years</p>
      <p><strong>Location:</strong> {user.doctor.location}</p>
      <p><strong>Verified:</strong> {user.doctor.isVerified ? "Yes" : "No"}</p>
      <p>
        <strong>Certificate:</strong>{" "}
        <a
          href={user.certificateUrl}
          className="text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          View Certificate
        </a>
      </p>
    </div>

    <div className="mt-6 w-full max-w-md text-left">
      <h3 className="font-semibold mb-2">Addresses:</h3>
      {user.doctor.addresses?.length > 0 ? (
        user.doctor.addresses.map((addr, i) => (
          <div key={i} className="text-sm pl-4 mb-2 border-l-2 border-blue-300">
            <p>
              {addr.doctor.line1}, {addr.doctor.city}, {addr.doctor.state} - {addr.doctor.pincode}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No addresses available.</p>
      )}
    </div>
  </div>
)}

        {user.role === "patient" && (
  <>
    <h1 className="text-3xl font-bold mb-3">{user.patient?.fullName}</h1>
    <p className="text-gray-600 mb-6">Role: {user.role || "N/A"}</p>
    <p className="mb-3">
      <strong>Email:</strong> {user.patient?.email}
    </p>

    <div className="mt-6">
      <h3 className="font-semibold mb-2">Address:</h3>
      {user.patient?.address ? (
        <p className="text-sm pl-4 text-gray-700">
          {user.patient?.address?.line1}, {user.patient?.address?.city},{" "}
          {user.patient?.address?.state} - {user.patient?.address?.pincode}
        </p>
      ) : (
        <p className="text-sm text-gray-500">No address available.</p>
      )}
    </div>

    <div className="mt-6">
      <h3 className="font-semibold mb-2">Associated Doctors:</h3>
      {user.patient?.doctors?.length > 0 ? (
        user.patient.doctors.map((doc, i) => (
          <div key={i} className="mb-3 pl-4 border-l-2 border-green-300">
            <p className="font-semibold text-blue-700">
              {doc.fullName} ({doc.specialization})
            </p>
            {doc.addresses?.map((a, j) => (
              <p key={j} className="text-sm text-gray-600 pl-2">
                {a.line1}, {a.city}, {a.state} - {a.pincode}
              </p>
            ))}
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No doctors linked.</p>
      )}
    </div>
  </>
)}
      </div>
    </div>
  );
}

export default ProfilePage;
