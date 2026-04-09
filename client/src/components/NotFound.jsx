import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center px-4 text-center">
      <div className="text-9xl font-black text-blue-100 select-none mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-full text-base font-medium hover:bg-blue-700 transition shadow-md">
          ← Back to Home
        </button>
      </Link>
    </div>
  );
}

export default NotFound;
