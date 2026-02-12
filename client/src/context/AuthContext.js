import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const normalized = {
          ...decoded,
          userId: typeof decoded.userId === 'string' ? decoded.userId.trim() : decoded.userId,
          email: typeof decoded.email === 'string' ? decoded.email.trim() : decoded.email,
          firstName: typeof decoded.firstName === 'string' ? decoded.firstName.trim() : decoded.firstName,
          lastName: typeof decoded.lastName === 'string' ? decoded.lastName.trim() : decoded.lastName
        };
        setUser(normalized);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token, logout]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const normalized = userData && {
      ...userData,
      userId: typeof userData.userId === 'string' ? userData.userId.trim() : userData.userId,
      email: typeof userData.email === 'string' ? userData.email.trim() : userData.email,
      firstName: typeof userData.firstName === 'string' ? userData.firstName.trim() : userData.firstName,
      lastName: typeof userData.lastName === 'string' ? userData.lastName.trim() : userData.lastName
    };
    setUser(normalized || userData);
    navigate('/Home');
  };

  const isAuthenticated = () => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
