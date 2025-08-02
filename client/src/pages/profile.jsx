import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import load from "../assets/Animation - 1750351638911.gif";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(
      "https://s82-balaji-capstone-careconnect-4.onrender.com/api/profile/upload-profile-photo",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ Backend should return updated image URL and store it in DB
    const newImageUrl = res.data.imageUrl;

    // ✅ Update state immediately for instant preview
    setUser((prev) => ({
      ...prev,
      doctor: {
        ...prev.doctor,
        image: newImageUrl,
      },
    }));

    alert("Profile photo updated successfully!");
  } catch (error) {
    console.error("Image upload failed", error);
    alert("Failed to upload image");
  }
};


  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://s82-balaji-capstone-careconnect-4.onrender.com/api/patientprofile/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log("Profile API response:", res.data);

        setUser(res.data.user);
      } catch (err) {
        console.error("Profile fetch error:", err?.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
    else setLoading(false);
  }, [token]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-blue-600">
        <img src={load} alt="Loading..." className="w-40 h-40 mb-4" />
        <p className="text-blue-600 text-lg font-semibold">Loading profile...</p>
      </div>
    );

  if (!user)
    return (
      <div className="text-center p-10 text-red-600">
        <p>User not logged in or failed to load profile.</p>
        <Link to="/login" className="text-blue-600 underline">
          Login
        </Link>
      </div>
    );

  let certificateUrl = null;
  if (user && user.role === "doctor" && user.doctor?.certificateUrl) {
    certificateUrl = `https://s82-balaji-capstone-careconnect-4.onrender.com/${user.doctor.certificateUrl}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b w-full from-blue-100 to-white p-8">
      <Link to="/" className="text-blue-700 flex items-center mb-6 hover:underline">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <div className="bg-white shadow-xl rounded-xl p-6 max-w-3xl mx-auto">
        {/* ✅ Doctor Profile Section */}
        {user.role === "doctor" && (
          <div className="flex flex-col items-center text-center">
            <img
  src={
    user.doctor.image
      ? `${user.doctor.image}?t=${new Date().getTime()}` // Cache-busting query param
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  }
  alt={user.doctor.fullName}
  className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-blue-300"
/>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profileImageInput"
            />
            <label
              htmlFor="profileImageInput"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Change Photo
            </label>

            <h1 className="text-3xl font-bold mb-2">{user.doctor.fullName}</h1>

            <Link
              to="/doctor/dashboard"
              className="mt-2 mb-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>

            <p className="text-sm text-gray-600 mb-4">Role: {user.role || "N/A"}</p>

            <div className="w-full max-w-md text-left space-y-2">
              <p>
                <strong>Email:</strong> {user.doctor.email}
              </p>
              <p>
                <strong>Specialization:</strong> {user.doctor.specialization}
              </p>
              <p>
                <strong>Experience:</strong> {user.doctor.experience} years
              </p>
              <p>
                <strong>Location:</strong> {user.doctor.location}
              </p>
              <p>
                <strong>Verified:</strong> {user.doctor.isVerified ? "Yes" : "No"}
              </p>

              {/* ✅ Certificate Section */}
              {user.doctor.certificateUrl ? (
                <>
                  <p>
                    <strong>Certificate:</strong>{" "}
                    <button
                      onClick={openModal}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      View Certificate
                    </button>
                  </p>

                  {/* Modal */}
                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                      <div className="bg-black p-6 rounded-lg max-w-3xl shadow-xl relative">
                        <button
                          onClick={closeModal}
                          className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl font-bold"
                        >
                          ×
                        </button>

                        {user.doctor.certificateUrl.endsWith(".pdf") ? (
                          <iframe
                            src={certificateUrl}
                            title="Doctor Certificate PDF"
                            className="w-[600px] h-[500px] border rounded"
                          />
                        ) : (
                          <img
                            src={certificateUrl}
                            alt="Doctor Certificate"
                            className="w-full max-h-[500px] object-contain rounded"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>
                  <strong>Certificate:</strong>{" "}
                  <span className="text-gray-500">Not uploaded</span>
                </p>
              )}
            </div>

            {/* ✅ Addresses */}
            <div className="mt-6 w-full max-w-md text-left">
              <h3 className="font-semibold mb-2">Addresses:</h3>
              {user.doctor.addresses?.length > 0 ? (
                user.doctor.addresses.map((addr, i) => (
                  <div
                    key={i}
                    className="text-sm pl-4 mb-2 border-l-2 border-blue-300"
                  >
                    <p>
                      {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No addresses available.</p>
              )}
            </div>
          </div>
        )}

        {/* ✅ Patient Profile Section */}
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
                  <div
                    key={i}
                    className="mb-3 pl-4 border-l-2 border-green-300"
                  >
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
