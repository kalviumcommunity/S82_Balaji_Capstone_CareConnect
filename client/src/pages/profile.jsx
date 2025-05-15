import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get auth token from localStorage or wherever you store it
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.log(err);
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

  if (loading) return <p className="text-center py-20">Loading profile...</p>;

  if (!user) return (
    <div className="text-center p-10 text-red-600">
      <p>User not logged in or failed to load profile.</p>
      <Link to="/login" className="text-blue-600 underline">Login</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <Link
        to="/"
        className="text-blue-700 flex items-center mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <div className="bg-white shadow-xl rounded-xl p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">{user.fullName}</h1>
        <p className="text-gray-600 mb-6">Role: {user.role || "N/A"}</p>

        <p className="mb-3"><strong>Email:</strong> {user.email}</p>

        {user.role === "doctor" && (
          <>
            <p><strong>Specialization:</strong> {user.specialization}</p>
            <p><strong>Experience:</strong> {user.experience} years</p>
            <p><strong>Location:</strong> {user.location}</p>
            <p><strong>Verified:</strong> {user.isVerified ? "Yes" : "No"}</p>
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

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Addresses:</h3>
              {user.addresses?.length > 0 ? (
                user.addresses.map((addr, i) => (
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
          </>
        )}

        {user.role === "patient" && (
          <>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Address:</h3>
              {user.address ? (
                <p className="text-sm pl-4 text-gray-700">
                  {user.address.line1}, {user.address.city}, {user.address.state} - {user.address.pincode}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No address available.</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Associated Doctors:</h3>
              {user.doctors?.length > 0 ? (
                user.doctors.map((doc, i) => (
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
