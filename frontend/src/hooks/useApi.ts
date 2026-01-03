import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('session_token');
    }
    return await SecureStore.getItemAsync('session_token');
  } catch {
    return null;
  }
};

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (config: AxiosRequestConfig): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(config);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
