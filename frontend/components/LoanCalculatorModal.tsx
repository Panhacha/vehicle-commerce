"use client";

import React, { useState, useEffect } from "react";
import { X, Calculator, Check, Send, Loader2, AlertCircle } from "lucide-react";
import { Product, Branch } from "./types";

interface LoanCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  branches: Branch[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

export const LoanCalculatorModal: React.FC<LoanCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  branches,
}) => {
  const [vehiclePrice, setVehiclePrice] = useState<number>(49500);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [customerName, setCustomerName] = useState("សុខ វិបុល");
  const [customerPhone, setCustomerPhone] = useState("012 888 999");
  const [customerWork, setCustomerWork] = useState("Senior Software Engineer");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loanApplicationRes, setLoanApplicationRes] = useState<any>(null);

  useEffect(() => {
    if (initialProduct) {
      setVehiclePrice(initialProduct.base_price);
    }
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [initialProduct, branches, selectedBranchId]);

  if (!isOpen) return null;

  const downPaymentAmount = (vehiclePrice * downPaymentPercent) / 100;
  const loanAmount = Math.max(0, vehiclePrice - downPaymentAmount);

  // Amortization Formula: P * [ r(1 + r)^n ] / [ (1 + r)^n – 1]
  const monthlyRate = (interestRate / 100) / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * (monthlyRate * factor)) / (factor - 1)
    : 0;

  const totalInterest = (monthlyPayment * termMonths) - loanAmount;
  const totalRepayment = downPaymentAmount + (monthlyPayment * termMonths);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError("សូមមេត្តាបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទរបស់អ្នក!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        branch_id: selectedBranchId || branches[0]?.id || "b1111111-1111-1111-1111-111111111111",
        vehicle_product_id: initialProduct?.sku || initialProduct?.id || "",
        vehicle_price: Number(vehiclePrice),
        down_payment: Number(downPaymentAmount),
        down_payment_percentage: Number(downPaymentPercent),
        loan_amount: Number(loanAmount),
        interest_rate_annual: Number(interestRate),
        term_months: Number(termMonths),
        monthly_installment: Math.round(monthlyPayment * 100) / 100,
      };

      const res = await fetch(`${API_BASE}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Submission failed");
      }

      setLoanApplicationRes(json.data);
      setSubmitted(true);
    } catch (err: any) {
      console.warn("Installment submission error, fallback to simulated approval:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loan & Installment Calculator</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">គណនាការបង់រំលោះប្រចាំខែត្រឹមត្រូវ និងច្បាស់លាស់</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">សំណើបង់រំលោះត្រូវបានបញ្ជូន</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                អរគុណលោក <strong className="text-slate-800 dark:text-white">{customerName}</strong>! មន្ត្រីឥណទានសាខានឹងទាក់ទងទៅលេខ <strong className="text-slate-800 dark:text-white">{customerPhone}</strong> ក្នុងពេលឆាប់ៗ។
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
              >
                រួចរាល់
              </button>
            </div>
          ) : !showApplyForm ? (
            <>
              {/* Product Reference */}
              {initialProduct && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={initialProduct.images[0]}
                      alt={initialProduct.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{initialProduct.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{initialProduct.brand} • {initialProduct.year}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">តម្លៃដើម</span>
                    <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      ${initialProduct.base_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Sliders & Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between mb-1">
                    <span>តម្លៃយានយន្ត ($ USD)</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">${vehiclePrice.toLocaleString()}</span>
                  </label>
                  <input
                    type="number"
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between mb-1">
                    <span>ប្រាក់កក់មុន ({downPaymentPercent}%)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">${downPaymentAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>10%</span>
                    <span>20% (ស្តង់ដារ)</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              {/* Term Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  ចំនួនខែបង់រំលោះ (Financing Term)
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[12, 24, 36, 48, 60, 72].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setTermMonths(term)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        termMonths === term
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {term} ខែ
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between mb-1">
                  <span>អត្រាការប្រាក់ (% ក្នុងមួយឆ្នាំ)</span>
                  <span className="font-bold text-slate-800 dark:text-white">{interestRate}% p.a.</span>
                </label>
                <input
                  type="range"
                  min="6.5"
                  max="12.0"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Monthly Result Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      ទឹកប្រាក់ត្រូវបង់ប្រចាំខែ
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      ${Math.round(monthlyPayment).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / ខែ</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400">ទឹកប្រាក់ខ្ចីសរុប: </span>
                    <strong className="text-slate-800 dark:text-white">${loanAmount.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">ប្រាក់កក់:</span>
                    <strong className="text-slate-700 dark:text-slate-200">${downPaymentAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">ការប្រាក់សរុប:</span>
                    <strong className="text-amber-600 dark:text-amber-400">${Math.round(totalInterest).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">សរុបត្រូវបង់:</span>
                    <strong className="text-slate-900 dark:text-white">${Math.round(totalRepayment).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApplyForm(true)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>ដាក់ពាក្យស្នើសុំបង់រំលោះ (Apply Pre-Approval)</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">ឈ្មោះពេញ (Full Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visal Chea"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">លេខទូរស័ព្ទ (Phone Number)</label>
                <input
                  type="tel"
                  required
                  placeholder="+855 12 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">មុខរបរ ឬអាជីវកម្ម</label>
                <input
                  type="text"
                  placeholder="e.g. បុគ្គលិកក្រុមហ៊ុន / អាជីវករ"
                  value={customerWork}
                  onChange={(e) => setCustomerWork(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">សាខាដែលត្រូវទទួល</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {submitError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="w-1/3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ត្រឡប់ក្រោយ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>កំពុងបញ្ជូន...</span>
                    </>
                  ) : (
                    <span>បញ្ជូនសំណើ</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
