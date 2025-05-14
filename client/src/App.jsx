import react from 'react';
import './App.css'
import {Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Loginpage';
import Signup from './pages/signuppage'
import GoogleSuccess from './pages/googleAuth/googlesuccess';
function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path="/google-success" element={<GoogleSuccess/>}/>
      </Routes>
    </div>
  )
}

export default App
