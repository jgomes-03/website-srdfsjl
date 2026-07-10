import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    console.log("Login response:", data);
    setUser(data);
    return data;
  };

  const loginWithMicrosoft = async (idToken, accessToken) => {
    console.log("Sending Microsoft tokens to backend");
    const { data } = await axios.post(`${API}/auth/microsoft`, {
      id_token: idToken || "",
      access_token: accessToken || "",
    }, { withCredentials: true });
    console.log("Microsoft login response:", data);
    if (data && data.id) {
      setUser(data);
    } else {
      throw new Error("Resposta invalida do servidor");
    }
    return data;
  };

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithMicrosoft, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
