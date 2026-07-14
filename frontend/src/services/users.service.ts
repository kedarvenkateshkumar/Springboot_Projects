import { api } from "@/lib/api";
import type { PageResponse, User } from "@/types";

export const usersService = {
  all: (page = 0, size = 20, search = "") =>
    api
      .get<PageResponse<User>>("/admin/users", { params: { page, size, search } })
      .then((r) => r.data),
  byId: (id: string | number) => api.get<User>(`/admin/users/${id}`).then((r) => r.data),

  stats: () =>
    api
      .get<{ totalProducts: number; totalUsers: number; totalOrders: number; revenue: number }>(
        "/admin/stats",
      )
      .then((r) => r.data),
};
