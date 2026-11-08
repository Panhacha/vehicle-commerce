"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Code,
  Check,
  Copy,
  ExternalLink,
  Car
} from "lucide-react";
import { useCart } from "./CartContext";

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, removeItem, updateQuantity, clearCart, totalItemCount } = useCart();
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isCartOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ cart }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Top Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Shopping Cart (កន្ត្រកទំនិញ)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {totalItemCount} គ្រឿង
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {cart.cart_id} • User: {cart.customer_id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowJsonModal(!showJsonModal)}
                title="មើលកូដ JSON (View JSON)"
                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Code className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* JSON Preview Modal / Slide Tab */}
          {showJsonModal && (
            <div className="p-4 bg-slate-950 text-slate-100 border-b border-slate-800 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-bold">Cart Schema JSON:</span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "បានចម្លង!" : "ចម្លង JSON"}</span>
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto text-[11px] leading-relaxed text-emerald-400 p-2 bg-slate-900 rounded">
                {JSON.stringify({ cart }, null, 2)}
              </pre>
            </div>
          )}

          {/* Main Scrollable Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    សូមជ្រើសរើសរថយន្តដែលអ្នកពេញចិត្តពី Showroom ដើម្បីបញ្ចូលក្នុងកន្ត្រក។
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  ទៅកាន់ Showroom មើលរថយន្ត
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200/90 dark:border-slate-700 shadow-xs flex gap-4 transition-all hover:border-slate-300"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-20 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {item.product_name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cart_item_id)}
                          title="លុបចេញពីកន្ត្រក"
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.selected_variant.color && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>{item.selected_variant.color}</span>
                          </span>
                        )}
                        {item.selected_variant.trim && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.selected_variant.trim}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        ${item.unit_price.toLocaleString()} USD
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Actions (Matches JSON Schema Exactly) */}
          {cart.items.length > 0 && (
            <div className="p-5 sm:p-6 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-4">
              
              {/* Summary Breakdown */}
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>តម្លៃទំនិញសរុប (Subtotal):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cart.summary.subtotal.toLocaleString()} USD
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ការបញ្ចុះតម្លៃ (Discount):</span>
                  <span className="font-bold text-emerald-600">
                    -${cart.summary.discount_amount.toLocaleString()} USD
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>សេវាដឹកជញ្ជូនប៉ាន់ស្មាន (Estimated Shipping):</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cart.summary.estimated_shipping.toLocaleString()} USD
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ទឹកប្រាក់សរុប (Grand Total):
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      ${cart.summary.grand_total.toLocaleString()} {cart.summary.currency}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      ≈ ៛{(cart.summary.grand_total * 4100).toLocaleString()} KHR
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ធានាសងប្រាក់វិញ 100% ក្នុង 14 ថ្ងៃ • ត្រួតពិនិត្យ 160 ចំណុច</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/checkout?mode=cart"
                  onClick={closeCart}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>បន្តទៅកាន់ Checkout (${cart.summary.grand_total.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex gap-2">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-center transition-colors"
                  >
                    មើលទំព័រ Cart ពេញលេញ
                  </Link>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-3 py-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    សម្អាតកន្ត្រក
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
