import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/authentication/Loginpage';
import Signup from './pages/authentication/signuppage';
<<<<<<< HEAD
import GoogleSuccess from './pages/googleAuth/googlesuccess';
=======
>>>>>>> AI-chatbot
import Speciality from './pages/speciality';
import NoDoctor from './pages/no-doctors';
import Doctor from './pages/doctorpage'; // 🧑‍⚕️ This will handle filtered doctors
import Profile from './pages/profile';
import DoctorsPage from './pages/doctorpage';
<<<<<<< HEAD
=======
import GoogleSuccess from './pages/googleAuth/googlesuccess';
import BookAppointment from './pages/appointmentbook';
import DoctorAppointments from './pages/DoctorAppointments'
import DoctorDashboard from './pages/doctordashboard';
import AiChatbot from './pages/aiintegration/aichatbot';
>>>>>>> AI-chatbot
function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/google-success' element={<GoogleSuccess />} />
        <Route path='/speciality' element={<Speciality />} />
        <Route path='/no-doctor' element={<NoDoctor />} />
        {/* <Route path='/doctors/:specialty' element={<Doctor />} /> ✅ Dynamic specialty route */}
        <Route path='/profile' element={<Profile />} />
        <Route path="/doctors/:specialty" element={<DoctorsPage />} />
<<<<<<< HEAD
=======
        <Route path="/book/:doctorId" element={<BookAppointment />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path='/ai-chat' element={<AiChatbot/>}/>
>>>>>>> AI-chatbot
      </Routes>
    </div>
  );
}

export default App;
