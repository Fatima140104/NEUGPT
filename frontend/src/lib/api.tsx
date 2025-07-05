import axios from "axios";
import { getToken, removeToken } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const navigate = useNavigate();
    if (error.response && error.response.status === 401) {
      removeToken();
      navigate("/");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
