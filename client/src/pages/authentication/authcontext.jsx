import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("userLoggedIn") === "true";
    console.log("🌐 Checking auth from localStorage:", isAuthenticated);
    setIsLoggedIn(isAuthenticated);
  }, []);

  const login = () => {
    console.log("✅ login() called");
    setIsLoggedIn(true);
    localStorage.setItem("userLoggedIn", "true");
  };
  


  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("userLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
