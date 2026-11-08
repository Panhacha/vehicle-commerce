"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Check,
  Sparkles,
  Building2,
  User,
  Phone,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Car,
  BadgeCheck,
  Lock,
  ArrowLeft,
  Calendar,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Product, Branch } from "./types";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  branches: Branch[];
  onOrderCreated: (order: any) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  product,
  branches,
  onOrderCreated,
}) => {
  // Booking Type: "DEPOSIT" ($1,000 reservation fee) vs "FULL" (full car price)
  const [bookingType, setBookingType] = useState<"DEPOSIT" | "FULL">("DEPOSIT");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<
    "bakong_khqr" | "cash_on_delivery" | "loan" | "trade_in"
  >("bakong_khqr");

  const { customer, isLoggedIn, openAuthModal } = useCustomerAuth();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || "branch_001");
  const [customerName, setCustomerName] = useState(customer?.full_name || "");
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || "");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"DETAILS" | "PAYMENT_QR" | "SUCCESS">("DETAILS");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (customer) {
      if (customer.full_name) setCustomerName(customer.full_name);
      if (customer.phone) setCustomerPhone(customer.phone);
    }
  }, [customer]);

  if (!isOpen || !product) return null;

  const depositAmount = 1000;
  const currentPayAmount = bookingType === "DEPOSIT" ? depositAmount : product.base_price;
  const remainingAmount = product.base_price - currentPayAmount;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      openAuthModal(undefined, `សូមចូលគណនី ឬចុះឈ្មោះជាមុនសិន ដើម្បីកក់រថយន្ត ${product.name}!`);
      return;
    }
    const orderNo = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(orderNo);

    if (paymentMethod === "bakong_khqr") {
      setStep("PAYMENT_QR");
    } else {
      setStep("SUCCESS");
    }

    onOrderCreated({
      id: "ord-" + Date.now(),
      order_no: orderNo,
      branch_id: selectedBranchId,
      branch_name: selectedBranch?.name || "Phnom Penh Main Showroom (HQ)",
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
      booking_type: bookingType,
      paid_amount: currentPayAmount,
      remaining_amount: remainingAmount,
      total_amount: product.base_price,
      notes: notes,
      status: "PROCESSING",
      payment_status: paymentMethod === "bakong_khqr" ? "PAID" : "UNPAID",
      created_at: new Date().toISOString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      {/* Horizontal Landscape Container - Extra Spacious & Large Text */}
      <div className="relative w-full max-w-5xl lg:max-w-6xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Accent Gradient Header */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        {/* Modal Main Body (Landscape 2 Columns) */}
        {step === "DETAILS" && (
          <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
            
            {/* ========================================================
                LEFT COLUMN: Vehicle Showcase & Price Summary (5 Cols)
               ======================================================== */}
            <div className="lg:col-span-5 bg-slate-50/90 dark:bg-slate-800/60 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto space-y-6">
              
              <div className="space-y-5">
                {/* Security Guarantee Pill (Large 14px Text) */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>ធានាសងប្រាក់កក់វិញ 100% • សុវត្ថិភាពខ្ពស់</span>
                </div>

                {/* Vehicle Showcase Card & Stage */}
                <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-700 p-4 flex items-center justify-center shadow-sm group">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : "https://example.com/images/toyota-4runner-2026.png"}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs">
                      {product.brand} • {product.year}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>មានក្នុងស្តុកស្រាប់</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-xs font-mono font-bold">
                    {product.sku || "TYT-4RNMAX-2026-02"}
                  </div>
                </div>

                {/* Vehicle Title & Specification */}
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {product.name}
                  </h4>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>{product.powertrain_type || "Powertrain Hybrid"}</span>
                    <span>•</span>
                    <span>{product.body_type || "Premium Vehicle"}</span>
                  </p>
                </div>

                {/* Booking Mode Switch: Deposit vs Full (Large Text) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 dark:text-white">
                    ជម្រើសនៃការទូទាត់ (Payment Preference)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-200/80 dark:bg-slate-800 p-2 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBookingType("DEPOSIT")}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                        bookingType === "DEPOSIT"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border-2 border-blue-600"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">កក់ប្រាក់កក់ទុក</span>
                        {bookingType === "DEPOSIT" ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                        )}
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        $1,000 USD
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        ពេញនិយម • សងវិញ 100%
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingType("FULL")}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                        bookingType === "FULL"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border-2 border-blue-600"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">ទូទាត់ពេញថ្លៃ</span>
                        {bookingType === "FULL" ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                        )}
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        ${product.base_price.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        ទទួលយានយន្តភ្លាមៗ
                      </div>
                    </button>
                  </div>
                </div>

                {/* Financial Summary Card (High Contrast, Big Digits) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <span>តម្លៃយានយន្តសរុប (Vehicle Price):</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ${product.base_price.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-bold">ទឹកប្រាក់ត្រូវទូទាត់ថ្ងៃនេះ ({bookingType === "DEPOSIT" ? "ប្រាក់កក់" : "ពេញថ្លៃ"}):</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      ${currentPayAmount.toLocaleString()} USD
                    </span>
                  </div>
                  {bookingType === "DEPOSIT" && (
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                      <span>ទឹកប្រាក់នៅសល់ (ទូទាត់ពេលទទួលឡាន):</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                        ${remainingAmount.toLocaleString()} USD
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantees Footnote */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ការធានាគុណភាពផ្លូវការ ៣ ឆ្នាំ ឬ ១០០,០០០ គីឡូម៉ែត្រ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ប្រព័ន្ធទូទាត់សុវត្ថិភាព KHQR តាមស្ដង់ដារធនាគារជាតិនៃកម្ពុជា</span>
                </div>
              </div>

            </div>

            {/* ========================================================
                RIGHT COLUMN: Form & Payment Selection (7 Cols)
               ======================================================== */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-5">
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Header with Title and Close Button */}
                <div className="flex items-start justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Checkout & Reserve Vehicle
                    </h3>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                      កក់ទុក ឬទិញយានយន្តរបស់អ្នកប្រកបដោយភាពងាយស្រួល
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/checkout?id=${product.id}`}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors"
                      title="បើកទំព័រ Checkout ពេញលេញ"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>បើកជា Page ពេញលេញ</span>
                    </Link>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Section 1: 4 Payment Methods (Large Text, High Contrast) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>១. ជ្រើសរើសវិធីសាស្រ្តទូទាត់ (Payment Method)</span>
                    </label>
                    <span className="text-xs font-semibold text-slate-500">ជ្រើសរើស ១ ក្នុងចំណោម ៤</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Method 1: Bakong KHQR */}
                    <div
                      onClick={() => setPaymentMethod("bakong_khqr")}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                        paymentMethod === "bakong_khqr"
                          ? "bg-red-50/80 dark:bg-red-950/40 border-red-500 shadow-md ring-2 ring-red-400/50"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0 shadow-xs">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Bakong KHQR</span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white">KHQR</span>
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          ស្កេនទូទាត់តាម App ធនាគារនានា
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 absolute top-4 right-3.5 ${
                        paymentMethod === "bakong_khqr" ? "border-red-600 bg-red-600 text-white" : "border-slate-400"
                      }`}>
                        {paymentMethod === "bakong_khqr" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Method 2: Cash / Direct Transfer */}
                    <div
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                        paymentMethod === "cash_on_delivery"
                          ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-400/50"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          សាច់ប្រាក់ / ផ្ទេរផ្ទាល់
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          ទូទាត់ផ្ទាល់នៅសាខាពេលទទួលយានយន្ត
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 absolute top-4 right-3.5 ${
                        paymentMethod === "cash_on_delivery" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400"
                      }`}>
                        {paymentMethod === "cash_on_delivery" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Method 3: Loan */}
                    <div
                      onClick={() => setPaymentMethod("loan")}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                        paymentMethod === "loan"
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-400/50"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          បង់រំលស់ (Loan)
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          បង់ប្រាក់កក់មុន រំលស់ ១២-៧២ ខែ
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 absolute top-4 right-3.5 ${
                        paymentMethod === "loan" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400"
                      }`}>
                        {paymentMethod === "loan" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Method 4: Trade-in */}
                    <div
                      onClick={() => setPaymentMethod("trade_in")}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                        paymentMethod === "trade_in"
                          ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          ប្តូរឡានចាស់ (Trade-in)
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          កាត់កងតម្លៃរថយន្តចាស់
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 absolute top-4 right-3.5 ${
                        paymentMethod === "trade_in" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-400"
                      }`}>
                        {paymentMethod === "trade_in" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Showroom Branch Dropdown */}
                <div className="space-y-2">
                  <label className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>២. សាខាដែលត្រូវទទួលយានយន្ត (Showroom Branch)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {branches && branches.length > 0 ? (
                        branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city})
                          </option>
                        ))
                      ) : (
                        <option value="branch_001">
                          Phnom Penh Main Showroom (HQ) (Phnom Penh)
                        </option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>បើកជារៀងរាល់ថ្ងៃ ៨:០០ ព្រឹក - ៦:០០ ល្ងាច • ទំនាក់ទំនងសាខា៖ 012 888 999</span>
                  </div>
                </div>

                {/* Section 3: Customer Information (Large Inputs) */}
                <div className="space-y-3">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>៣. ព័ត៌មានអតិថិជន (Customer Information)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                        ឈ្មោះអតិថិជន <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="ឈ្មោះរបស់អ្នក"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                        លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-5 h-5" />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="+855 12 345 678"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes Input */}
                  <div>
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      ចំណាំបន្ថែម (Notes)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. ស្នើសុំជួយសម្រួលធ្វើស្លាកលេខជូនខ្ញុំ..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Big Action Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-black text-lg tracking-wide shadow-xl shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center gap-3"
                  >
                    <span>បញ្ជាក់ការកក់ប្រាក់ (${currentPayAmount.toLocaleString()} USD)</span>
                    <ArrowRight className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </div>
              </form>

            </div>

          </div>
        )}

        {/* ========================================================
            STEP 2: BAKONG KHQR PAYMENT (Landscape Wide View)
           ======================================================== */}
        {step === "PAYMENT_QR" && (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Left Side: Summary & Instructions */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-red-600 text-white text-sm font-black tracking-wider">
                    KHQR
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">BAKONG SYSTEM</span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    ស្កេនទូទាត់ជាមួយ KHQR
                  </h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    លោកអ្នកអាចស្កេនទូទាត់តាម App ធនាគារនានាក្នុងប្រទេសកម្ពុជា (ABA, ACLEDA, Canadia, Sathapana, Wing, Chip Mong...)។
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-xs font-bold text-slate-500 uppercase">ចំនួនទឹកប្រាក់ត្រូវទូទាត់:</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ${currentPayAmount.toLocaleString()} <span className="text-base font-normal text-slate-500">USD</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ≈ ៛{(currentPayAmount * 4100).toLocaleString()} KHR
                  </div>
                  <div className="text-xs text-slate-500 font-mono pt-1">
                    Ref ID: {orderNumber}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("DETAILS")}
                    className="px-5 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>កែប្រែ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("SUCCESS")}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>បញ្ជាក់ការទូទាត់រួចរាល់ (Simulate Paid)</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Big Official Scannable KHQR Code */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <div className="w-60 h-60 bg-white border-2 border-slate-300 rounded-2xl p-3 flex items-center justify-center relative shadow-lg">
                  <QrCode className="w-52 h-52 text-slate-950" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-md">
                      KH
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-mono font-bold mt-3">
                  Scan to Pay • Merchant: VEHICLEHUB
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: SUCCESS CONFIRMATION RECEIPT (Landscape)
           ======================================================== */}
        {step === "SUCCESS" && (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Left Side: Success Status */}
              <div className="space-y-5 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md mx-auto md:mx-0">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    ការកក់ទុកទទួលបានជោគជ័យ!
                  </h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    ការបញ្ជាក់ការកក់យានយន្តរបស់អ្នកត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធគ្រប់គ្រង និងបានជូនដំណឹងទៅកាន់បុគ្គលិកសាខា {selectedBranch?.name} រួចរាល់។
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-5 h-5" />
                    <span>បោះពុម្ពប័ណ្ណកក់</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg transition-colors cursor-pointer"
                  >
                    រួចរាល់
                  </button>
                </div>
              </div>

              {/* Right Side: Digital Slip (Large Text) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2.5 border-b-2 border-slate-200 dark:border-slate-700">
                  <span className="text-xs uppercase font-extrabold text-slate-500">លេខវិក្កយបត្រកក់</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-base">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">យានយន្ត:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">ប្រភេទការកក់:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {bookingType === "DEPOSIT" ? "កក់ប្រាក់កក់ទុក ($1,000)" : "ទូទាត់ពេញថ្លៃ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">សាខាទទួលរៀបចំ:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedBranch?.name || "Phnom Penh Main Showroom (HQ)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">អតិថិជន:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {customerName || "អតិថិជន"} ({customerPhone || "ទូរស័ព្ទ"})
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-200 dark:border-slate-700 pt-3 text-base">
                  <span className="font-bold text-slate-600 dark:text-slate-400">ទឹកប្រាក់បានទូទាត់:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                    ${currentPayAmount.toLocaleString()} USD
                  </span>
                </div>
                {bookingType === "DEPOSIT" && (
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>ទឹកប្រាក់នៅសល់ពេលទទួលឡាន:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      ${remainingAmount.toLocaleString()} USD
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderModal;
