import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  // LinkedIn login removed - using static data
  
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Posts services
export const postsService = {
  getAllPosts: async () => {
    const response = await api.get('/posts');
    return response.data.posts;
  },
  
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data.post;
  },
  
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data.post;
  },
  
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data.post;
  },
  
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  optimizePost: async (id) => {
    const response = await api.post(`/posts/${id}/optimize`);
    return response.data.post;
  },
  
  scheduleOptimal: async (id) => {
    const response = await api.post(`/posts/${id}/schedule-optimal`);
    return response.data.post;
  },
  
  recycleEvergreen: async () => {
    const response = await api.post('/posts/recycle-evergreen');
    return response.data;
  },
  
  // LinkedIn publishing removed - using static data
};

export default api;