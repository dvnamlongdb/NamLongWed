/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo
const DEMO_USERS = {
  admin: {
    id: 'user_001',
    username: 'admin',
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@namlong.com',
    role: 'admin',
    department: 'admin',
    position: 'Quản trị viên',
    phone: '0901234567',
    avatar: null,
    birthDate: '15/05/1990',
    gender: 'male',
    idNumber: '123456789012',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    emergencyContact: 'Nguyễn Thị Lan',
    emergencyPhone: '0987654321',
    bankAccount: '1234567890',
    bankName: 'vietcombank',
    notes: 'Quản trị viên hệ thống',
  },
  director: {
    id: 'user_002',
    username: 'director',
    fullName: 'Trần Văn Giám Đốc',
    email: 'director@namlong.com',
    role: 'director',
    department: 'admin',
    position: 'Giám đốc',
    phone: '0901234568',
    avatar: null,
    birthDate: '20/03/1980',
    gender: 'male',
    idNumber: '123456789013',
    address: '456 Đường DEF, Phường ABC, Quận 2, TP.HCM',
    emergencyContact: 'Trần Thị Mai',
    emergencyPhone: '0987654322',
    bankAccount: '2234567890',
    bankName: 'techcombank',
    notes: 'Giám đốc điều hành',
  },
  hr_manager: {
    id: 'user_003',
    username: 'hr_manager',
    fullName: 'Lê Thị Nhân Sự',
    email: 'hr@namlong.com',
    role: 'hr',
    department: 'hr',
    position: 'Trưởng phòng Nhân sự',
    phone: '0901234569',
    avatar: null,
    birthDate: '15/08/1985',
    gender: 'female',
    idNumber: '123456789014',
    address: '789 Đường GHI, Phường DEF, Quận 3, TP.HCM',
    emergencyContact: 'Lê Văn Nam',
    emergencyPhone: '0987654323',
    bankAccount: '3234567890',
    bankName: 'bidv',
    notes: 'Trưởng phòng Nhân sự',
  },
  accountant: {
    id: 'user_004',
    username: 'accountant',
    fullName: 'Phạm Văn Kế Toán',
    email: 'accounting@namlong.com',
    role: 'manager',
    department: 'accounting',
    position: 'Trưởng phòng Kế toán',
    phone: '0901234570',
    avatar: null,
    birthDate: '10/12/1988',
    gender: 'male',
    idNumber: '123456789015',
    address: '321 Đường JKL, Phường GHI, Quận 4, TP.HCM',
    emergencyContact: 'Phạm Thị Lan',
    emergencyPhone: '0987654324',
    bankAccount: '4234567890',
    bankName: 'vietinbank',
    notes: 'Trưởng phòng Kế toán',
  },
  employee: {
    id: 'user_005',
    username: 'employee',
    fullName: 'Hoàng Thị Nhân Viên',
    email: 'employee@namlong.com',
    role: 'employee',
    department: 'sales',
    position: 'Nhân viên kinh doanh',
    phone: '0901234571',
    avatar: null,
    birthDate: '25/06/1992',
    gender: 'female',
    idNumber: '123456789016',
    address: '654 Đường MNO, Phường JKL, Quận 5, TP.HCM',
    emergencyContact: 'Hoàng Văn Bình',
    emergencyPhone: '0987654325',
    bankAccount: '5234567890',
    bankName: 'agribank',
    notes: 'Nhân viên kinh doanh',
  },
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with admin user by default
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        setCurrentUser(DEMO_USERS.admin);
      }
    } else {
      setCurrentUser(DEMO_USERS.admin);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = (username, password) => {
    // Simple demo login logic
    const user = DEMO_USERS[username];
    if (user) {
      setCurrentUser(user);
      return Promise.resolve(user);
    }
    return Promise.reject(new Error('Invalid credentials'));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchUser = (userType) => {
    const user = DEMO_USERS[userType];
    if (user) {
      setCurrentUser(user);
    }
  };

  const updateUser = (updates) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
    }
  };

  const userRole = currentUser?.role || 'employee';
  const userDepartment = currentUser?.department || 'sales';

  const contextValue = {
    currentUser,
    userRole,
    userDepartment,
    isLoading,
    login,
    logout,
    switchUser,
    updateUser,
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 