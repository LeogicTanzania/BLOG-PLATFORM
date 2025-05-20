import axios from "axios";

// New axios instance with baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:3001",
});

// Request interceptor to attach JWT token to each request
api.interceptors.request.use(
  (config) => {
    // Retrieve token from local storage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Return modified request config
    return config;
  },

  // If theres an error in the request setup, reject the promise
  (error) => Promise.reject(error)
);

export default api;
