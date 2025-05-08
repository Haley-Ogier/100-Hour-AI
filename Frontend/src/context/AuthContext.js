import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [curAccount, setAcc] = useState("");

  useEffect(() => {
    // Optional: check localStorage or API token here
    const auth = localStorage.getItem("isAuthenticated");
    const acc = localStorage.getItem("curAccount");
    setIsAuthenticated(auth === "true");
    setAcc(acc == !"");
  }, []);

  const signIn = (e) => {
    setIsAuthenticated(true);
    setAcc(e);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("curAccount", e);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setAcc("");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("curAccount");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, curAccount, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
