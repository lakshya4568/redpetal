import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, getAuthToken, removeAuthToken } from "./api";

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
  guestLogin: () => Promise<void>;
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
  guestLogin: async () => {},
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

  const GUEST_KEY = "guestSession";

  const checkAuthState = async () => {
    try {
      // If guest flag is set, restore lightweight guest user
      const guest = await AsyncStorage.getItem(GUEST_KEY);
      if (guest) {
        const parsed = JSON.parse(guest);
        setUser(parsed.user as User);
        return;
      }

      const token = await getAuthToken();
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.user);
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      // Token might be expired, clear it
      await removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
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
      console.error("Registration error:", error);
      throw error;
    }
  };

  const guestLogin = async () => {
    try {
      const guestUser: User = {
        id: "guest",
        email: "guest@redpetal.local",
        username: "Guest",
      };
      await AsyncStorage.setItem(
        GUEST_KEY,
        JSON.stringify({ user: guestUser })
      );
      setUser(guestUser);
    } catch (error) {
      console.error("Guest login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_KEY);
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        guestLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
