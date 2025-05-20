import api from "./api";

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

export const register = (username, email, password) =>
  api.post("/api/auth/register", { username, email, password });

export const getCurrentUser = () => api.get("/api/auth/currentuser");
