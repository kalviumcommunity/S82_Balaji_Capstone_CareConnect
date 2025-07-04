import React,{useRef} from 'react';
import { Search, Award, Shield, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { useAuth } from './authentication/authcontext';
import '../app.css'
import '../index.css'
function Home() {
  const specialties = [
    { title: 'Pulmonologist', icon: '🫁',link:'doctors/pulmonologist' },
    { title: 'Dermatologist', icon: '👨‍⚕️' ,link:'doctors/dermatologist'},
    { title: 'Pediatrics', icon: '👶',link:'doctors/pedatrics' },
    { title: 'Gynecologist', icon: '👩',link:'/doctors/gynecologist'},
    { title: 'Cardiologist', icon: '❤️' ,link:'/doctors/cardiologist'},
  { title: 'Neurologist', icon: '🧠' ,link:'/doctors/neurologist'},
  { title: 'Orthopedic', icon: '🦴' ,link:'/doctors/orthopedic'},
  { title: 'ENT Specialist', icon: '👂' ,link:'/doctors/ent'}
  ];

  const specialref = useRef();

  const scrollleft = ()=>{
    specialref.current.scrollBy({left:-200,behavior:'smooth'});
  }

  const scrollright = ()=>{
    specialref.current.scrollBy({left:200,behavior:'smooth'});
  }

  const features = [
    { title: 'Experienced Doctors', icon: <Award className="w-8 h-8 mx-auto text-blue-700" /> },
    { title: 'Search by Speciality', icon: <Search className="w-8 h-8 mx-auto text-blue-700" /> },
    { title: 'Seamless Care', icon: <Award className="w-8 h-8 mx-auto text-blue-700" /> },
    { title: 'Verified Doctors', icon: <Shield className="w-8 h-8 mx-auto text-blue-700" /> }
  ];

  const { isLoggedIn, logout } = useAuth(); // ✅ Get values from context



  return (
    <>
      <div className="bubble-wrapper to-blue-500">
  {[...Array(10)].map((_, i) => (
    <span className={`bubble bubble-${i + 1}`} key={i}>red</span>
  ))}
</div>

    <div className="w-full min-h-screen flex flex-col relative z-10 bg-gradient-to-b from-sky-100 to-white">

      
      {/* Navigation */}
      <nav className="w-full h-16 flex justify-between items-center from-sky-200 px-4">
        <h1 className="text-2xl font-semibold text-blue-700">Care Connect</h1>
        <div className="flex items-center gap-4">
          <div className="space-x-4">
  {isLoggedIn ? (
    <button
      onClick={logout}
      className="px-4 py-2 bg-blue-400 text-white rounded-full"
    >
      Logout
    </button>
  ) : (
    <>
      <Link to="/login">
        <button className="px-4 py-2 bg-blue-700 text-white rounded-full">Login</button>
      </Link>
      <Link to="/signup">
        <button className="px-4 py-2 bg-blue-700 text-white rounded-full">Sign Up</button>
      </Link>
    </>
  )}
</div>
          <Link to="/profile">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
              <CgProfile className="text-xl" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="w-full py-12 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Find the Right<br />
                Doctor, Anytime,<br />
                Anywhere!
              </h2>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Doctor"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section className="w-full py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Search by Speciality</h2>
              <Link to='/speciality'>
              <button className="flex items-center gap-2 text-blue-700 font-semibold">
                Explore All
                <ChevronRight className="w-5 h-5" />
              </button>
              </Link>
            </div>
            <div className="relative">
              <div ref={specialref} className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
                {specialties.map((specialty, index,link) => (
                  <Link to={specialty.link || "/doctors"} key={index}>
                  <div key={index} className="flex-none w-50 h-50 bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="text-4xl mb-3 relative top-3">{specialty.icon}</div>
                    
                    <h3 className="font-semibold top-10 relative">{specialty.title}</h3>
                  </div>
                  </Link>
                ))}
              </div>
              <button onClick={scrollleft} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={scrollright} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 bg-sky-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 text-center md:text-left">
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm">Why choose us</span>
              <h2 className="text-3xl font-bold mt-4">Why us for your <span className="text-blue-700">Health Care</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl text-center shadow">
                  {feature.icon}
                  <h3 className="mt-3 font-medium text-sm">{feature.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="w-full py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Our Vision</h2>
            <div className="bg-sky-50 p-8 rounded-3xl text-gray-700 leading-relaxed text-left shadow-md">
              <p>
                Our vision is to create a user-friendly platform that helps people find trusted and qualified doctors based on their specialty, location, and patient reviews. We aim to simplify the search for medical professionals by providing accurate information and personalized recommendations. By building a transparent and informative system, we empower users to make confident healthcare decisions. Our platform will support doctors in showcasing their expertise while improving access to quality care for all.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-blue-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5" />
                <span>Careconnect@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>+91 6352478570</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our services</h3>
              <ul className="space-y-2">
                <li>Pulmonology</li>
                <li>Gynecology</li>
                <li>Dermatology</li>
                <li>Pediatrics</li>
              </ul>
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-4">Care Connect</h1>
              <p className="text-sm opacity-80">"Better doctors lead better outcomes. Others hold your hand."</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default Home;
