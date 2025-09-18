/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1/api";

const getClientToken = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getClientToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}` as any;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): any => response,
  (error) => Promise.reject(error)
);

export const apiService = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    return await apiClient.post("/login", credentials).then(r => r.data);
  },
  register: async (userData: { username: string; password: string; email?: string }) => {
    return await apiClient.post("/register", userData).then(r => r.data);
  },
  post: async (endpoint: string, data: any) => {
    return await apiClient.post(endpoint, data).then(r => r.data);
  },

  // Staff
  getStaff: async () => {
    return await apiClient.get("/staff").then(r => r.data);
  },
  createStaff: async (staffData: any) => {
    return await apiClient.post("/staff", staffData).then(r => r.data);
  },
  updateStaff: async (id: string, updateData: any) => {
    return await apiClient.put(`/staff/${id}`, updateData).then(r => r.data);
  },
  deleteStaff: async (id: string) => {
    return await apiClient.delete(`/staff/${id}`).then(r => r.data);
  },

  // Customers
  getCustomers: async () => {
    return await apiClient.get("/customers").then(r => r.data);
  },
  createCustomer: async (customerData: any) => {
    return await apiClient.post("/customers", customerData).then(r => r.data);
  },
  updateCustomer: async (id: string, updateData: any) => {
    return await apiClient.put(`/customers/${id}`, updateData).then(r => r.data);
  },
  deleteCustomer: async (id: string) => {
    return await apiClient.delete(`/customers/${id}`).then(r => r.data);
  },

  // Investments
  getInvestments: async () => {
    return await apiClient.get("/investments").then(r => r.data);
  },
  createInvestment: async (investmentData: any) => {
    return await apiClient.post("/investments", investmentData).then(r => r.data);
  },
  updateInvestment: async (id: string, updateData: any) => {
    return await apiClient.put(`/investments/${id}`, updateData).then(r => r.data);
  },
  deleteInvestment: async (id: string) => {
    return await apiClient.delete(`/investments/${id}`).then(r => r.data);
  },

  // Invoices
  getInvoices: async () => {
    return await apiClient.get("/invoices").then(r => r.data);
  },
  createInvoice: async (invoiceData: any) => {
    return await apiClient.post("/invoices", invoiceData).then(r => r.data);
  },
  updateInvoice: async (id: string, updateData: any) => {
    return await apiClient.put(`/invoices/${id}`, updateData).then(r => r.data);
  },
  deleteInvoice: async (id: string) => {
    return await apiClient.delete(`/invoices/${id}`).then(r => r.data);
  },

  // Salaries
  getSalaries: async () => {
    return await apiClient.get("/salary").then(r => r.data);
  },
  createSalary: async (salaryData: any) => {
    return await apiClient.post("/salary", salaryData).then(r => r.data);
  },
  updateSalary: async (id: string, updateData: any) => {
    return await apiClient.put(`/salary/${id}`, updateData).then(r => r.data);
  },
  deleteSalary: async (id: string) => {
    return await apiClient.delete(`/salary/${id}`).then(r => r.data);
  },
};
