import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api, { tokens } from "../lib/api";

const AuthContext = createContext(null);

function hasValidSession() {
  const token = tokens.refresh || tokens.access;
  if (!token) return false;
  try {
    return jwtDecode(token).exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(hasValidSession);
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/profile/");
      setProfile(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post("/token/", { username: identifier.trim(), password });
    tokens.set(data.access, data.refresh);
    setIsLoggedIn(true);
  };

  const register = (payload) => api.post("/user/register/", payload);

  const logout = useCallback(() => {
    tokens.clear();
    setIsLoggedIn(false);
    setProfile(null);
  }, []);

  useEffect(() => {
    if (isLoggedIn) refreshProfile();
  }, [isLoggedIn, refreshProfile]);

  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, profile, setProfile, refreshProfile, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
