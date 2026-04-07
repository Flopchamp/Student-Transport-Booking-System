import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally — show toast + redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (status === 404) {
      toast.error('The requested resource was not found');
    } else if (status === 409) {
      toast.error(message);
    } else if (status === 422 || status === 400) {
      toast.error(message);
    } else if (status && status >= 500) {
      toast.error('Server error — please try again later');
    } else if (!error.response) {
      toast.error('Network error — check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;
