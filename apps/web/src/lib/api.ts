import axios from "axios";
import { getApiKey } from "../hooks/localStorage";

const { VITE_API_URL: baseURL } = import.meta.env;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers["x-api-key"] = apiKey;
  }
  return config;
});
