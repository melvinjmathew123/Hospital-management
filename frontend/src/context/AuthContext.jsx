import React, { createContext, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout, verifyEmailOtp, fetchCurrentUser, clearAuthError, API_URL } from '../store/slices/authSlice';

export { API_URL } from '../store/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector(state => state.auth);

  // On mount (or token change), hydrate user from server
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      return { success: true };
    } else {
      const payload = result.payload;
      return { success: false, message: payload?.message, isVerified: payload?.isVerified, otp: payload?.otp };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Server is offline' };
    }
  };

  const verifyRegistration = async (email, otp) => {
    const result = await dispatch(verifyEmailOtp({ email, otp }));
    if (verifyEmailOtp.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, message: result.payload?.message };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearAuthError());
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login,
      logout: handleLogout,
      resendOtp,
      verifyRegistration,
      clearError: handleClearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
