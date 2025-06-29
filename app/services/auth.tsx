import React, { createContext, useContext, useState } from "react";

// Mock user object for development
const MOCK_USER = {
  uid: "mock-user-id",
  email: "test@example.com",
};

interface AuthContextType {
  user: typeof MOCK_USER | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);

  const login = () => {
    // In a real app, you'd handle credentials
    setUser(MOCK_USER);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
