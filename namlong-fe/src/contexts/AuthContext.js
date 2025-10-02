/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from "@/service";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
  try {
    const data = await apiService.login({ username, password }); // gọi BE
    if (data?.token) {
      localStorage.setItem('token', data.token);
      // Lưu toàn bộ user info từ BE
      const user = data.user || { username }; 
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};



  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const updateUser = (updates) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    updateUser,
    userRole: currentUser?.role,
    userDepartment: currentUser?.department,
    userPosition: currentUser?.position,
    isAdmin: currentUser?.role === 'admin',
    isDirector: currentUser?.role === 'director',
    isHR: currentUser?.role === 'hr',
    isTechManager: currentUser?.role === 'tech_manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
