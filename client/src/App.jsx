import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/authentication/Loginpage';
import Signup from './pages/authentication/signuppage';
import GoogleSuccess from './pages/googleAuth/googlesuccess';
import Speciality from './pages/speciality';
import NoDoctor from './pages/no-doctors';
import Doctor from './pages/doctorpage'; // 🧑‍⚕️ This will handle filtered doctors
import Profile from './pages/profile';
import DoctorsPage from './pages/doctorpage';
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
      </Routes>
    </div>
  );
}

export default App;
