"use client";

import React from "react";
import { CartProvider } from "./CartContext";
import { CustomerAuthProvider } from "./CustomerAuthContext";
import { CustomerAuthModal } from "./CustomerAuthModal";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        {children}
        <CustomerAuthModal />
      </CartProvider>
    </CustomerAuthProvider>
  );
};

export default Providers;
