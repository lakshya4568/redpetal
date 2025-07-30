import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, getAuthToken } from "./api";

interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Token might be expired, clear it
      await authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
