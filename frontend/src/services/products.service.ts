import { api } from "@/lib/api";
import type { Category, PageResponse, Product, ProductQuery } from "@/types";

export const productsService = {
  list: (q: ProductQuery = {}) =>
    api.get<PageResponse<Product>>("/products", { params: q }).then((r) => r.data),

  featured: () => api.get<Product[]>("/products/featured").then((r) => r.data),

  latest: () => api.get<Product[]>("/products/latest").then((r) => r.data),

  byId: (id: string | number) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  related: (id: string | number) =>
    api.get<Product[]>(`/products/${id}/related`).then((r) => r.data),

  categories: () => api.get<Category[]>("/categories").then((r) => r.data),

  // Admin
  create: (body: Omit<Product, "id">) =>
    api.post<Product>("/products", body).then((r) => r.data),
  update: (id: string | number, body: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, body).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/products/${id}`).then((r) => r.data),
};
