export type Role = "ROLE_USER" | "ROLE_ADMIN";

export interface User {
  id: number | string;
  username: string;
  email?: string;
  roles: Role[];
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  user: User;
}

export interface Category {
  id: number | string;
  name: string;
  slug?: string;
}

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId?: number | string;
  categoryName?: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  productId: number | string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number | string;
  userId?: number | string;
  username?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress?: string;
}

export interface ProductQuery {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number | string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}
