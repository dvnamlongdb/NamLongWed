/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import { useCallback, useState } from "react";
import { apiService } from "."; // Import updated API service

/**
 * API response interface
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Hook for API calls with loading and error states
 */
export const useApi = <T = any>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  /**
   * Execute API request with error handling
   */
  const execute = useCallback(
    async (apiCall: () => Promise<any>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        const payload = (response && typeof response === 'object' && 'data' in response)
          ? (response as any).data
          : response;
        setData(payload);
        return payload;
      } catch (err: any) {
        const errorMessage = err.message || "Something went wrong";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    execute,
    clearError: () => setError(null),
    clearData: () => setData(null)
  };
};

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 */
export const useMutation = <T = any>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute mutation with error handling
   */
  const mutate = useCallback(
    async (apiCall: () => Promise<any>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        return (response && typeof response === 'object' && 'data' in response)
          ? (response as any).data
          : response;
      } catch (err: any) {
        const errorMessage = err.message || "Something went wrong";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    mutate,
    clearError: () => setError(null)
  };
};

/**
 * Specific hooks for each entity
 */

// Staff hooks
export const useStaff = () => {
  const { loading, error, data, execute } = useApi();
  
  const getStaff = useCallback(() => {
    return execute(() => apiService.getStaff());
  }, [execute]);

  return { loading, error, data, getStaff };
};

export const useStaffMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createStaff = useCallback((staffData: any) => {
    return mutate(() => apiService.createStaff(staffData));
  }, [mutate]);

  const updateStaff = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateStaff(id, updateData));
  }, [mutate]);

  const deleteStaff = useCallback((id: string) => {
    return mutate(() => apiService.deleteStaff(id));
  }, [mutate]);

  return { loading, error, createStaff, updateStaff, deleteStaff };
};

// Customer hooks
export const useCustomers = () => {
  const { loading, error, data, execute } = useApi();
  
  const getCustomers = useCallback(() => {
    return execute(() => apiService.getCustomers());
  }, [execute]);

  return { loading, error, data, getCustomers };
};

export const useCustomerMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createCustomer = useCallback((customerData: any) => {
    return mutate(() => apiService.createCustomer(customerData));
  }, [mutate]);

  const updateCustomer = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateCustomer(id, updateData));
  }, [mutate]);

  const deleteCustomer = useCallback((id: string) => {
    return mutate(() => apiService.deleteCustomer(id));
  }, [mutate]);

  return { loading, error, createCustomer, updateCustomer, deleteCustomer };
};

// Investment hooks
export const useInvestments = () => {
  const { loading, error, data, execute } = useApi();
  
  const getInvestments = useCallback(() => {
    return execute(() => apiService.getInvestments());
  }, [execute]);

  return { loading, error, data, getInvestments };
};

export const useInvestmentMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createInvestment = useCallback((investmentData: any) => {
    return mutate(() => apiService.createInvestment(investmentData));
  }, [mutate]);

  const updateInvestment = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateInvestment(id, updateData));
  }, [mutate]);

  const deleteInvestment = useCallback((id: string) => {
    return mutate(() => apiService.deleteInvestment(id));
  }, [mutate]);

  return { loading, error, createInvestment, updateInvestment, deleteInvestment };
};

// Invoice hooks
export const useInvoices = () => {
  const { loading, error, data, execute } = useApi();
  
  const getInvoices = useCallback(() => {
    return execute(() => apiService.getInvoices());
  }, [execute]);

  return { loading, error, data, getInvoices };
};

export const useInvoiceMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createInvoice = useCallback((invoiceData: any) => {
    return mutate(() => apiService.createInvoice(invoiceData));
  }, [mutate]);

  const updateInvoice = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateInvoice(id, updateData));
  }, [mutate]);

  const deleteInvoice = useCallback((id: string) => {
    return mutate(() => apiService.deleteInvoice(id));
  }, [mutate]);

  return { loading, error, createInvoice, updateInvoice, deleteInvoice };
};

// Salary hooks (for invoice expenses - old mockSalaries)
export const useSalaries = () => {
  const { loading, error, data, execute } = useApi();
  
  const getSalaries = useCallback(() => {
    return execute(() => apiService.getSalaries());
  }, [execute]);

  return { loading, error, data, getSalaries };
};

export const useSalaryMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createSalary = useCallback((salaryData: any) => {
    return mutate(() => apiService.createSalary(salaryData));
  }, [mutate]);

  const updateSalary = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateSalary(id, updateData));
  }, [mutate]);

  const deleteSalary = useCallback((id: string) => {
    return mutate(() => apiService.deleteSalary(id));
  }, [mutate]);

  return { loading, error, createSalary, updateSalary, deleteSalary };
};

// Employee Salary hooks
export const useEmployeeSalaries = () => {
  const { loading, error, data, execute } = useApi();
  
  const getEmployeeSalaries = useCallback(() => {
    return execute(() => apiService.getEmployeeSalaries());
  }, [execute]);

  return { loading, error, data, getEmployeeSalaries };
};

export const useEmployeeSalaryMutation = () => {
  const { loading, error, mutate } = useMutation();

  const createEmployeeSalary = useCallback((salaryData: any) => {
    return mutate(() => apiService.createEmployeeSalary(salaryData));
  }, [mutate]);

  const updateEmployeeSalary = useCallback((id: string, updateData: any) => {
    return mutate(() => apiService.updateEmployeeSalary(id, updateData));
  }, [mutate]);

  const deleteEmployeeSalary = useCallback((id: string) => {
    return mutate(() => apiService.deleteEmployeeSalary(id));
  }, [mutate]);

  return { loading, error, createEmployeeSalary, updateEmployeeSalary, deleteEmployeeSalary };
};

// Authentication hooks
export const useAuth = () => {
  const { loading, error, mutate } = useMutation();

  const login = useCallback((credentials: { username: string; password: string }) => {
    return mutate(() => apiService.login(credentials));
  }, [mutate]);

  const register = useCallback((userData: { username: string; password: string; email?: string }) => {
    return mutate(() => apiService.register(userData));
  }, [mutate]);

  const logout = useCallback(() => {
    apiService.logout();
  }, []);

  const getCurrentUser = useCallback(() => {
    return apiService.getCurrentUser();
  }, []);

  return { loading, error, login, register, logout, getCurrentUser };
};

// Legacy hooks for backward compatibility
export const useRestApi = useApi;

// ===== PROJECT PROGRESS HOOKS =====

// Projects
export const useProjects = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getProjects };
};

export const useProjectMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(async (projectData) => {
    try {
      setLoading(true);
      const response = await apiService.createProject(projectData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    try {
      setLoading(true);
      const response = await apiService.updateProject(id, projectData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await apiService.deleteProject(id);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProject, updateProject, deleteProject, loading, error };
};

// Project Progress
export const useProjectProgress = (projectId = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProjectProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjectProgress(projectId);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { data, loading, error, getProjectProgress };
};

export const useProjectProgressMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProgress = useCallback(async (progressData) => {
    try {
      setLoading(true);
      const response = await apiService.createProjectProgress(progressData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (id, progressData) => {
    try {
      setLoading(true);
      const response = await apiService.updateProjectProgress(id, progressData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProgress = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await apiService.deleteProjectProgress(id);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveProgress = useCallback(async (progressId, approverData) => {
    try {
      setLoading(true);
      const response = await apiService.approveProgress(progressId, approverData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProgress, updateProgress, deleteProgress, approveProgress, loading, error };
};

// Approval History
export const useApprovalHistory = (projectId = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApprovalHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getApprovalHistory(projectId);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { data, loading, error, getApprovalHistory };
};
