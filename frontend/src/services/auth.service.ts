import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }).then((r) => r.data),

  register: (username: string, password: string, email?: string) =>
    api
      .post<AuthResponse>("/auth/register", { username, password, email })
      .then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
