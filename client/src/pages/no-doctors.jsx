import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function NoDoctorsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sky-100 to-white px-4">
      
      {/* Back to Home */}
      <Link to="/" className="absolute top-6 left-6 text-blue-700 flex items-center hover:underline">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      {/* Empty State Illustration */}
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXYwY2hweGYzOXB0cnljNWIzNzc3dWU0aGV6ZGRmN2QyYnp5a240YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gfsQffBnuc6e096brx/giphy.gif"
        alt="No Doctors Found"
        className="w-80 max-w-full mb-8 rounded-xl"
      />

      {/* Message */}
      <h1 className="text-3xl font-bold text-blue-800 mb-2">No Doctors Found</h1>
      <p className="text-gray-600 text-center max-w-md">
        Oops! We couldn’t find any doctors for this specialty right now. Please try a different category or check back later.
      </p>
    </div>
  );
}

export default NoDoctorsPage;
