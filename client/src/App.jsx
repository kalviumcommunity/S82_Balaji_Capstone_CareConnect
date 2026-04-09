import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/authentication/Loginpage';
import Signup from './pages/authentication/signuppage';
import Speciality from './pages/speciality';
import NoDoctor from './pages/no-doctors';
import DoctorsPage from './pages/doctorpage';
import Profile from './pages/profile';
import GoogleSuccess from './pages/googleAuth/googlesuccess';
import BookAppointment from './pages/appointmentbook';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorDashboard from './pages/doctordashboard';
import AiChatbot from './pages/aiintegration/aichatbot';
import AdminPanel from './pages/adminpanel';
import NotFound from './components/NotFound';

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
        <Route path='/profile' element={<Profile />} />
        <Route path='/doctors/:specialty' element={<DoctorsPage />} />
        <Route path='/book/:doctorId' element={<BookAppointment />} />
        <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
        <Route path='/doctor/appointments' element={<DoctorAppointments />} />
        <Route path='/ai-chat' element={<AiChatbot />} />
        {/* Secret admin route - not linked anywhere in the UI */}
        <Route path='/cc-admin-panel' element={<AdminPanel />} />
        {/* 404 catch-all */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
