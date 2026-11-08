"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CustomerUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  created_at?: string;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalPrompt: string;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, phone: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openAuthModal: (callback?: () => void, promptMessage?: string) => void;
  closeAuthModal: () => void;
  executePendingAction: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

const STORAGE_USER_KEY = "drivex_customer_user";
const STORAGE_TOKEN_KEY = "drivex_customer_token";

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState("");
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (storedUser && storedToken) {
        setCustomer(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      // Storage error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = useCallback((callback?: () => void, promptMessage?: string) => {
    setAuthModalPrompt(
      promptMessage || "ដើម្បីធ្វើការកក់ ឬកុម្ម៉ង់រថយន្ត សូមចូលគណនី ឬចុះឈ្មោះបង្កើតគណនីជាមុនសិន!"
    );
    if (callback) {
      setPendingCallback(() => callback);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  }, []);

  const executePendingAction = useCallback(() => {
    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      cb();
    }
  }, [pendingCallback]);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: pass
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: json.error || "លេខទូរស័ព្ទ អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" };
      }

      const userObj = json.user as CustomerUser;
      const userToken = json.token as string;

      setCustomer(userObj);
      setToken(userToken);

      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_TOKEN_KEY, userToken);
      } catch (e) {
        // storage fallback
      }

      setIsAuthModalOpen(false);
      executePendingAction();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ" };
    }
  };

  const register = async (
    fullName: string,
    phone: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: pass
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: json.error || "ការចុះឈ្មោះមិនបានជោគជ័យ សូមពិនិត្យព័ត៌មានឡើងវិញ" };
      }

      const userObj = json.user as CustomerUser;
      const userToken = json.token as string;

      setCustomer(userObj);
      setToken(userToken);

      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_TOKEN_KEY, userToken);
      } catch (e) {
        // storage fallback
      }

      setIsAuthModalOpen(false);
      executePendingAction();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ" };
    }
  };

  const logout = useCallback(() => {
    setCustomer(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    } catch (e) {
      // storage fallback
    }
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoggedIn: !!customer,
        isLoading,
        isAuthModalOpen,
        authModalPrompt,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        executePendingAction
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};

