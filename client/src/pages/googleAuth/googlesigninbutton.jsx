import React from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://s82-balaji-capstone-careconnect-4.onrender.com';

function GoogleSignInButton() {
  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };
  return (
    <button onClick={handleGoogleSignIn} className="bg-red-500 text-white px-4 py-2 rounded">
      Continue with Google
    </button>
  )
}

export default GoogleSignInButton