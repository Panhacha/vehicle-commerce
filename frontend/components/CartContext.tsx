"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "./types";

export interface SelectedVariant {
  color: string;
  trim?: string;
  wheels?: string;
  [key: string]: any;
}

export interface CartItem {
  cart_item_id: string;
  product_id: string;
  product_name: string;
  selected_variant: SelectedVariant;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

export interface CartSummary {
  subtotal: number;
  discount_amount: number;
  estimated_shipping: number;
  grand_total: number;
  currency: string;
}

export interface CartData {
  cart_id: string;
  customer_id: string;
  items: CartItem[];
  summary: CartSummary;
}

interface CartContextType {
  cart: CartData;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    product: Product | { id: string; name: string; base_price: number; images?: string[] },
    variant?: SelectedVariant,
    quantity?: number
  ) => void;
  removeItem: (cart_item_id: string) => void;
  updateQuantity: (cart_item_id: string, deltaOrQuantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  lastAddedItemName: string | null;
}

const DEFAULT_SAMPLE_CART: CartData = {
  cart_id: "cart_123456",
  customer_id: "user_789",
  items: [
    {
      cart_item_id: "item_001",
      product_id: "prod_taicoma_2026",
      product_name: "Toyota Tacoma 2026",
      selected_variant: {
        color: "Blue",
        trim: "TRD Off-Road",
      },
      unit_price: 38500,
      quantity: 1,
      total_price: 38500,
      image_url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80",
    },
  ],
  summary: {
    subtotal: 38500,
    discount_amount: 0,
    estimated_shipping: 500,
    grand_total: 39000,
    currency: "USD",
  },
};

function recalculateSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
  const discount_amount = 0;
  const estimated_shipping = items.length > 0 ? 500 : 0;
  const grand_total = subtotal - discount_amount + estimated_shipping;
  return {
    subtotal,
    discount_amount,
    estimated_shipping,
    grand_total,
    currency: "USD",
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartData>(DEFAULT_SAMPLE_CART);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItemName, setLastAddedItemName] = useState<string | null>(null);

  // Load from localStorage on client mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vehiclehub_cart_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save to localStorage when cart changes
  const saveCart = (updatedCart: CartData) => {
    setCart(updatedCart);
    try {
      localStorage.setItem("vehiclehub_cart_v1", JSON.stringify(updatedCart));
    } catch (e) {
      console.warn("Failed to save cart to localStorage", e);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (
    product: Product | { id: string; name: string; base_price: number; images?: string[] },
    variant: SelectedVariant = { color: "Blue", trim: "Standard Edition" },
    quantity: number = 1
  ) => {
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.selected_variant.color === variant.color &&
        item.selected_variant.trim === variant.trim
    );

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = [...cart.items];
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        total_price: newQty * existing.unit_price,
      };
    } else {
      const newItem: CartItem = {
        cart_item_id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        product_id: product.id,
        product_name: product.name,
        selected_variant: variant,
        unit_price: product.base_price,
        quantity: quantity,
        total_price: product.base_price * quantity,
        image_url:
          product.images && product.images.length > 0
            ? product.images[0]
            : "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80",
      };
      updatedItems = [...cart.items, newItem];
    }

    const updatedSummary = recalculateSummary(updatedItems);
    saveCart({
      ...cart,
      items: updatedItems,
      summary: updatedSummary,
    });

    setLastAddedItemName(product.name);
    setIsCartOpen(true);
  };

  const removeItem = (cart_item_id: string) => {
    const updatedItems = cart.items.filter((item) => item.cart_item_id !== cart_item_id);
    const updatedSummary = recalculateSummary(updatedItems);
    saveCart({
      ...cart,
      items: updatedItems,
      summary: updatedSummary,
    });
  };

  const updateQuantity = (cart_item_id: string, deltaOrQuantity: number) => {
    const updatedItems = cart.items
      .map((item) => {
        if (item.cart_item_id === cart_item_id) {
          const newQty = Math.max(1, item.quantity + deltaOrQuantity);
          return {
            ...item,
            quantity: newQty,
            total_price: newQty * item.unit_price,
          };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    const updatedSummary = recalculateSummary(updatedItems);
    saveCart({
      ...cart,
      items: updatedItems,
      summary: updatedSummary,
    });
  };

  const clearCart = () => {
    const emptySummary: CartSummary = {
      subtotal: 0,
      discount_amount: 0,
      estimated_shipping: 0,
      grand_total: 0,
      currency: "USD",
    };
    saveCart({
      ...cart,
      items: [],
      summary: emptySummary,
    });
  };

  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemCount,
        lastAddedItemName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
