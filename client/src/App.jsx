import react from 'react';
import './App.css'
import {Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Loginpage';
import Signup from './pages/signuppage'
function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  )
}

export default App
