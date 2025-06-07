import api from "./api";

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

export const register = (formData) =>
  api.post("/api/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCurrentUser = () => api.get("/api/auth/currentuser");
