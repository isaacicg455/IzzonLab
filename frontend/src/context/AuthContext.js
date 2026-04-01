import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('izzon_token'));

  const autenticado = !!token;

  function login(nuevoToken) {
    localStorage.setItem('izzon_token', nuevoToken);
    setToken(nuevoToken);
  }

  function logout() {
    localStorage.removeItem('izzon_token');
    setToken(null);
  }

  function authHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return (
    <AuthContext.Provider value={{ autenticado, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
