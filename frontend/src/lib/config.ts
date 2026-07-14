// Central API configuration. Change VITE_API_BASE_URL in .env to point at
// your Spring Boot backend (e.g. http://localhost:8080/api).
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api";

export const TOKEN_STORAGE_KEY = "shop_auth_token";
export const USER_STORAGE_KEY = "shop_auth_user";
