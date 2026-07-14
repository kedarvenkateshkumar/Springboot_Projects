import { api } from "@/lib/api";
import type { CartItem } from "@/types";

// Optional server-backed cart. The store falls back to local state if these
// endpoints aren't wired in the Spring Boot backend yet.
export const cartService = {
  get: () => api.get<CartItem[]>("/cart").then((r) => r.data),
  add: (productId: number | string, quantity: number) =>
    api.post<CartItem[]>("/cart/items", { productId, quantity }).then((r) => r.data),
  update: (productId: number | string, quantity: number) =>
    api.put<CartItem[]>(`/cart/items/${productId}`, { quantity }).then((r) => r.data),
  remove: (productId: number | string) =>
    api.delete<CartItem[]>(`/cart/items/${productId}`).then((r) => r.data),
  clear: () => api.delete("/cart").then((r) => r.data),
};
