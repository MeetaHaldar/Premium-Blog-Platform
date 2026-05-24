import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://premium-blog-platform-7wt2.vercel.app/";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => apiClient.post("/auth/register", data),
  verifyOTP: (data: any) => apiClient.post("/auth/verify-otp", data),
  resendOTP: (data: any) => apiClient.post("/auth/resend-otp", data),
  login: (data: any) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  forgotPassword: (data: any) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data: any) => apiClient.post("/auth/reset-password", data),
};

export const blogAPI = {
  getAllBlogs: (params?: any) => apiClient.get("/blogs", { params }),
  getMyBlogs: (params?: any) => apiClient.get("/blogs/my-blogs", { params }),
  getBlogBySlug: (slug: string) => apiClient.get(`/blogs/${slug}`),
  createBlog: (data: any) => apiClient.post("/blogs", data),
  updateBlog: (id: string, data: any) => apiClient.put(`/blogs/${id}`, data),
  deleteBlog: (id: string) => apiClient.delete(`/blogs/${id}`),
  toggleLike: (blogId: string) => apiClient.post(`/blogs/${blogId}/like`),
};

export const paymentAPI = {
  createCheckoutSession: (data: { blogId: string }) =>
    apiClient.post("/payments/create-checkout-session", data),
  verifySession: (data: { sessionId: string }) =>
    apiClient.post("/payments/verify-session", data),
  getPaymentHistory: (params?: any) =>
    apiClient.get("/payments/history", { params }),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const userAPI = {
  getProfile: () => apiClient.get("/user/profile"),
  updateProfile: (data: { name?: string; email?: string }) =>
    apiClient.put("/user/profile", data),
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.put("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/user/change-password", data),
};

export default apiClient;
