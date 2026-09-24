import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44329/api", // ✅ MUST MATCH BACKEND PORT
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = "Bearer " + token;
  return req;
});

export default api;