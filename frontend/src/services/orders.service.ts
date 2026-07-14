import { api } from "@/lib/api";
import type { Order, OrderStatus, PageResponse } from "@/types";

export interface PlaceOrderPayload {
  items: { productId: number | string; quantity: number }[];
  shippingAddress: string;
}

export const ordersService = {
  myOrders: () => api.get<Order[]>("/orders/me").then((r) => r.data),
  byId: (id: string | number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  place: (body: PlaceOrderPayload) =>
    api.post<Order>("/orders", body).then((r) => r.data),

  // Admin
  all: (page = 0, size = 20) =>
    api
      .get<PageResponse<Order>>("/admin/orders", { params: { page, size } })
      .then((r) => r.data),
  updateStatus: (id: string | number, status: OrderStatus) =>
    api.patch<Order>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};
