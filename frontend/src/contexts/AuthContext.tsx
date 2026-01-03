import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStoredToken = async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem('session_token');
      }
      return await SecureStore.getItemAsync('session_token');
    } catch {
      return null;
    }
  };

  const setStoredToken = async (token: string | null) => {
    try {
      if (Platform.OS === 'web') {
        if (token) {
          localStorage.setItem('session_token', token);
        } else {
          localStorage.removeItem('session_token');
        }
      } else {
        if (token) {
          await SecureStore.setItemAsync('session_token', token);
        } else {
          await SecureStore.deleteItemAsync('session_token');
        }
      }
    } catch (e) {
      console.error('Error storing token:', e);
    }
  };

  const checkAuth = async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
    } catch (error) {
      console.log('Auth check failed:', error);
      await setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const processSessionId = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/auth/session`, {
        session_id: sessionId,
      });

      const { session_token, ...userData } = response.data;
      await setStoredToken(session_token);
      setUser(userData);
    } catch (error) {
      console.error('Error processing session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const extractSessionId = (url: string): string | null => {
    try {
      // Check hash fragment
      if (url.includes('#session_id=')) {
        const match = url.match(/#session_id=([^&]+)/);
        return match ? match[1] : null;
      }
      // Check query params
      if (url.includes('?session_id=') || url.includes('&session_id=')) {
        const match = url.match(/[?&]session_id=([^&#]+)/);
        return match ? match[1] : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Platform-specific redirect URL
      const redirectUrl = Platform.OS === 'web'
        ? `${BACKEND_URL}/`
        : Linking.createURL('/');
      
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        // Web: Direct redirect
        window.location.href = authUrl;
      } else {
        // Mobile: Use WebBrowser
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          const sessionId = extractSessionId(result.url);
          if (sessionId) {
            await processSessionId(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await setStoredToken(null);
      setUser(null);
    }
  };

  // Check for session_id on mount (web) or from deep link (mobile)
  useEffect(() => {
    const handleInitialUrl = async () => {
      if (Platform.OS === 'web') {
        const hash = window.location.hash;
        const search = window.location.search;
        const sessionId = extractSessionId(hash) || extractSessionId(search);
        
        if (sessionId) {
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          await processSessionId(sessionId);
        } else {
          await checkAuth();
        }
      } else {
        // Mobile: Check initial URL (cold start)
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const sessionId = extractSessionId(initialUrl);
          if (sessionId) {
            await processSessionId(sessionId);
            return;
          }
        }
        await checkAuth();
      }
    };

    handleInitialUrl();

    // Listen for deep links (mobile hot start)
    if (Platform.OS !== 'web') {
      const subscription = Linking.addEventListener('url', async (event) => {
        const sessionId = extractSessionId(event.url);
        if (sessionId) {
          await processSessionId(sessionId);
        }
      });

      return () => subscription.remove();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
