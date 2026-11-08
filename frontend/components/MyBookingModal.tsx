"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Search,
  Car,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  Receipt
} from "lucide-react";
import { OrderTrackingTimeline } from "./OrderTrackingTimeline";

interface MyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

export const MyBookingModal: React.FC<MyBookingModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [localBookings, setLocalBookings] = useState<any[]>([]);

  // Load bookings from localStorage on open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = JSON.parse(localStorage.getItem("drivex_user_bookings") || "[]");
        setLocalBookings(stored);
        if (stored.length > 0 && !searchTerm) {
          setSearchTerm(stored[0].order_no || stored[0].customer_phone || "");
        }
      } catch (e) {
        setLocalBookings([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (termToSearch?: string) => {
    const term = (termToSearch ?? searchTerm).trim();
    if (!term) {
      setError("សូមវាយបញ្ចូលលេខកូដកក់ (Order No) ឬលេខទូរស័ព្ទរបស់អ្នក!");
      return;
    }

    setError("");
    setLoading(true);
    setSearchedOrder(null);

    try {
      const res = await fetch(`${API_BASE}/orders/track?reference=${encodeURIComponent(term)}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        // Fallback: Check in local bookings
        const found = localBookings.find(
          (b) =>
            b.order_no?.toLowerCase() === term.toLowerCase() ||
            b.customer_phone?.replace(/\s+/g, "") === term.replace(/\s+/g, "")
        );
        if (found) {
          setSearchedOrder(found);
          return;
        }
        throw new Error(json?.error || "រកមិនឃើញការកក់យានយន្តជាមួយលេខសម្គាល់ ឬលេខទូរស័ព្ទនេះទេ។");
      }

      setSearchedOrder(json.data);
    } catch (err: any) {
      // Local fallback lookup
      const found = localBookings.find(
        (b) =>
          b.order_no?.toLowerCase() === term.toLowerCase() ||
          b.customer_phone?.replace(/\s+/g, "") === term.replace(/\s+/g, "")
      );
      if (found) {
        setSearchedOrder(found);
      } else {
        setError(err.message || "មិនអាចទាញយកទិន្នន័យការកក់បានទេ។");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { text: "បានបញ្ជាក់ (CONFIRMED)", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" };
      case "PROCESSING":
      case "PREPARING":
        return { text: "កំពុងរៀបចំ (PREPARING)", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300" };
      case "READY_FOR_PICKUP":
        return { text: "រួចរាល់សម្រាប់ទទួល (READY)", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300" };
      case "COMPLETED":
        return { text: "បានប្រគល់រួចរាល់ (COMPLETED)", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" };
      case "CANCELLED":
        return { text: "បានលុបចោល (CANCELLED)", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300" };
      default:
        return { text: "កំពុងរង់ចាំ (PENDING)", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>តាមដានការកក់របស់ខ្ញុំ</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  MY BOOKING
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                វាយបញ្ចូលលេខកូដកក់ (Order No) ឬលេខទូរស័ព្ទដើម្បីពិនិត្យស្ថានភាព
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Search Box */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ឧ. VH-202611-12345 ឬ 012 888 999"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-slate-950 font-black text-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>ស្វែងរក</span>
              </button>
            </form>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick-select recent bookings from localStorage */}
          {localBookings.length > 0 && !searchedOrder && (
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                <span>ការកក់ថ្មីៗរបស់អ្នក (Recent Bookings):</span>
                <span className="text-[10px] text-slate-400">{localBookings.length} Saved</span>
              </div>
              <div className="space-y-2">
                {localBookings.map((b, idx) => (
                  <div
                    key={b.order_no || idx}
                    onClick={() => {
                      setSearchTerm(b.order_no);
                      handleSearch(b.order_no);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black font-mono text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {b.order_no}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.customer_name} • {b.customer_phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${b.total_amount?.toLocaleString() || "1,000"} USD
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details Result */}
          {searchedOrder && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Live Order Activity Timeline (សកម្មភាពនៃការកក់/កុម្ម៉ង់ & ការដឹកជញ្ជូនរថយន្ត) */}
              <OrderTrackingTimeline
                orderNo={searchedOrder.order_no}
                initialOrder={searchedOrder}
                checkoutMode={searchedOrder.items?.length > 1 ? "CART" : "VEHICLE"}
                vehicleName={searchedOrder.items?.[0]?.item_name}
                branchName={searchedOrder.branch_name}
                customerName={searchedOrder.customer_name}
                customerPhone={searchedOrder.customer_phone}
                compact={true}
              />

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">លេខកូដកក់យានយន្ត</div>
                    <div className="text-lg font-black font-mono text-amber-500">
                      {searchedOrder.order_no}
                    </div>
                  </div>

                  {(() => {
                    const b = getStatusBadge(searchedOrder.status);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${b.color} self-start sm:self-auto`}>
                        {b.text}
                      </span>
                    );
                  })()}
                </div>

                {/* Customer & Branch Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 text-xs font-bold block mb-0.5">អតិថិជន (Customer)</span>
                    <div className="font-bold text-slate-900 dark:text-white">{searchedOrder.customer_name}</div>
                    <div className="text-slate-500 font-mono text-xs">{searchedOrder.customer_phone}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-xs font-bold block mb-0.5">សាខា Showroom (Pickup Branch)</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {searchedOrder.branch_name || "Phnom Penh Main Showroom (HQ)"}
                    </div>
                    <div className="text-slate-500 text-xs">
                      Preah Monivong Blvd, Sangkat Boeung Keng Kang 1
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {searchedOrder.items && searchedOrder.items.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-xs font-bold block mb-2">មុខទំនិញ / យានយន្តដែលបានកក់</span>
                    <div className="space-y-1.5">
                      {searchedOrder.items.map((it: any, i: number) => (
                        <div key={it.id || i} className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="font-bold text-slate-900 dark:text-white">
                            • {it.item_name} {it.quantity > 1 ? `x${it.quantity}` : ""}
                          </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            ${it.subtotal?.toLocaleString()} USD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">ស្ថានភាពទូទាត់</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {searchedOrder.payment_status === "PAID" ? "ទូទាត់រួចរាល់ (PAID)" : "បានកក់ប្រាក់ (DEPOSIT PAID)"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block text-xs">ទឹកប្រាក់សរុប</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      ${(searchedOrder.total_amount || 0).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Contact Showroom CTA */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href="tel:+85523888999"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>ទាក់ទង Showroom (+855 23 888 999)</span>
                  </a>

                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <span>មើលម៉ូតឡានផ្សេងទៀត</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ប្រព័ន្ធទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាពក្នុង Supabase Cloud DB</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

