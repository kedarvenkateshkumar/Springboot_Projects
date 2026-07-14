import axios, { AxiosError } from "axios";
import { API_BASE_URL, TOKEN_STORAGE_KEY } from "./config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

export type ApiError = AxiosError<{ message?: string; error?: string }>;

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const e = err as ApiError;
  return e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? fallback;
}
