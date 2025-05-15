import react from 'react';
import './App.css'
import {Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Loginpage';
import Signup from './pages/signuppage'
import GoogleSuccess from './pages/googleAuth/googlesuccess';
import Speciality from './pages/speciality'
import NoDoctor from './pages/no-doctors'
import Doctor from './pages/doctorpage'
import Profile from './pages/profile'
function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path="/google-success" element={<GoogleSuccess/>}/>
        <Route path='/speciality' element={<Speciality/>}/>
        <Route path='/no-doctor' element={<NoDoctor/>}/>
        <Route path='/doctors' element={<Doctor/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </div>
  )
}

export default App
