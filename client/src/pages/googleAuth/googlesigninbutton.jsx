import React from 'react'
  
  function GoogleSignInButton() {
    const handleGoogleSignIn = () => {
        window.location.href = "https://s82-balaji-capstone-careconnect-4.onrender.com/api/auth/google";
      };
      console.log(window.location.href)
    return (
        <button onClick={handleGoogleSignIn} className="bg-red-500 text-white px-4 py-2 rounded">
        Continue with Google
      </button>
    )
  }
  
  export default GoogleSignInButton