import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">CareConnect</h1>
        <ul className="flex gap-6 text-sm font-medium text-gray-700">
          <li
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </li>
          <li
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => navigate("/doctor/appointments")}
          >
            Appointments
          </li>
          <li className="hover:text-blue-600 cursor-pointer">Contact</li>
          <li
            className="hover:text-red-500 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      </nav>

      {/* Main Dashboard */}
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold mb-4 text-blue-800">
          Welcome, Doctor 👨‍⚕️
        </h2>

        <p className="text-gray-600 mb-6">
          Here is your dashboard where you can manage appointments and view patient info.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Your Appointments</h3>
            <p className="text-gray-600 mb-4">
              View and manage upcoming appointments with your patients.
            </p>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Go to Appointments
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Contact Support</h3>
            <p className="text-gray-600 mb-4">
              Need help or have questions? Reach out to our support team.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
