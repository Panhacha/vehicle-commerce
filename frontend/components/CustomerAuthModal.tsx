"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  User,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Car
} from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalPrompt,
    login,
    register,
    executePendingAction
  } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginIdentifier.trim()) {
      setErrorMsg("សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលរបស់អ្នក!");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("សូមបញ្ចូលលេខសម្ងាត់!");
      return;
    }

    setIsSubmitting(true);
    const res = await login(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "ការចូលប្រើមិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ");
    } else {
      setSuccessMsg("ចូលប្រើប្រាស់បានជោគជ័យ!");
      setTimeout(() => {
        closeAuthModal();
      }, 500);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regFullName.trim()) {
      setErrorMsg("សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក!");
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg("សូមបញ្ចូលលេខទូរស័ព្ទសម្រាប់ទាក់ទង!");
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMsg("លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ!");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("លេខសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ!");
      return;
    }

    setIsSubmitting(true);
    const res = await register(regFullName, regPhone, regEmail, regPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "ការចុះឈ្មោះមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត");
    } else {
      setSuccessMsg("ចុះឈ្មោះ និងបង្កើតគណនីបានជោគជ័យ!");
      setTimeout(() => {
        closeAuthModal();
      }, 500);
    }
  };

  // Quick 1-click Demo Account login/register
  const handleDemoAccount = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    // Try login as test user, if not exists then register
    const res = await login("012888999", "password123");
    if (!res.success) {
      const regRes = await register("សុខ វិបុល (Sok Vibol)", "012 888 999", "vibol@drivex.com", "password123");
      setIsSubmitting(false);
      if (!regRes.success) {
        // If already exists under slightly different format, try login with spaced phone
        const retryLogin = await login("012 888 999", "password123");
        if (retryLogin.success) {
          closeAuthModal();
        } else {
          setErrorMsg("មិនអាចចូលគណនីតេស្តបានទេ សូមសាកល្បងចុះឈ្មោះថ្មី។");
        }
      } else {
        closeAuthModal();
      }
    } else {
      setIsSubmitting(false);
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Branding */}
        <div className="p-6 bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-white relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-black">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>DriveX Customer Security</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                {activeTab === "LOGIN" ? "ចូលប្រើប្រាស់គណនី" : "បង្កើតគណនីអតិថិជន"}
              </h3>
            </div>
          </div>

          {/* Context Prompt Message */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">
              {authModalPrompt || "លោកអ្នកត្រូវមានគណនីជាមុនសិន ដើម្បីអាចធ្វើការកក់ ឬកុម្ម៉ង់យានយន្តបាន។"}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("LOGIN");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "LOGIN"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            ចូលគណនី (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("REGISTER");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "REGISTER"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            ចុះឈ្មោះថ្មី (Create Account)
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  លេខទូរស័ព្ទ ឬ អ៊ីមែល (Phone / Email)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 012 888 999 ឬ name@email.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  លេខសម្ងាត់ (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="បញ្ចូលលេខសម្ងាត់របស់អ្នក"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងចូលប្រើប្រាស់...</span>
                  </>
                ) : (
                  <>
                    <span>ចូលប្រើប្រាស់គណនី (Log In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះពេញ (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ឧ. សុខ វិបុល (Sok Vibol)"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  លេខទូរស័ព្ទ (Phone Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="ឧ. 012 888 999"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  អ៊ីមែល (Email Address - ស្រេចចិត្ត)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ឧ. vibol@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខសម្ងាត់ *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="យ៉ាងហោច ៤ តួ"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បញ្ជាក់លេខសម្ងាត់ *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="បញ្ចូលម្តងទៀត"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRegPassword}
                    onChange={(e) => setShowRegPassword(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>បង្ហាញលេខសម្ងាត់</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងបង្កើតគណនី...</span>
                  </>
                ) : (
                  <>
                    <span>ចុះឈ្មោះបង្កើតគណនី (Sign Up)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Instant 1-Click Demo Account for quick test */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDemoAccount}
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>⚡ ចូលប្រើគណនីតេស្តសាកល្បង (1-Click Test Demo)</span>
            </button>
          </div>

        </div>

        {/* Footer info note */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500">
          <span>🔒 ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាពខ្ពស់បំផុតក្នុង DriveX Cloud DB</span>
        </div>

      </div>
    </div>
  );
};

export default CustomerAuthModal;

