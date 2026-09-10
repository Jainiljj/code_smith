import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string;
  permissions: string[];
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: String) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gem_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('gem_auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            userId: data.userId,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            organizationId: data.organizationId,
            permissions: data.permissions || [],
          });
          setToken(storedToken);
        } else {
          // Invalid or expired token
          localStorage.removeItem('gem_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Failed to verify session token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: String): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setIsLoading(false);
        return {
          success: false,
          error: errorData.message || errorData.error || 'Authentication failed. Please check credentials.',
        };
      }

      const data = await res.json();
      const authToken = data.token;
      
      localStorage.setItem('gem_auth_token', authToken);
      setToken(authToken);
      setUser({
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        organizationId: data.organizationId,
        permissions: data.permissions || [],
      });

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Network error connecting to authentication server.',
      };
    }
  };

  const logout = async () => {
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('gem_auth_token');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SYSTEM_ADMIN' || user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        permissions: user?.permissions || [],
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
