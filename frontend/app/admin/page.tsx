"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LockKeyhole, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Car, 
  ArrowUpRight, 
  Loader2, 
  AlertCircle,
  Building2,
  Users,
  Shield
} from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { adminApi, AdminSession } from "@/components/adminApi";
import {
  Branch,
  BranchInventoryItem,
  AdminUser,
  InstallmentPaymentSchedule,
  InstallmentApplication,
  NotificationLog,
  Order,
  Product,
  StockMovement,
  StockTransfer,
  TelegramStatus,
  TradeInRequest,
} from "@/components/types";

interface LoginResponse {
  token: string;
}

interface ApiList<T> {
  data: T[];
}

interface DashboardData {
  branches: Branch[];
  products: Product[];
  inventory: BranchInventoryItem[];
  orders: Order[];
  tradeIns: TradeInRequest[];
  installments: InstallmentApplication[];
  transfers: StockTransfer[];
  movements: StockMovement[];
  schedules: InstallmentPaymentSchedule[];
  users: AdminUser[];
  telegramStatus: TelegramStatus | null;
  notificationLogs: NotificationLog[];
}

const emptyDashboard: DashboardData = {
  branches: [],
  products: [],
  inventory: [],
  orders: [],
  tradeIns: [],
  installments: [],
  transfers: [],
  movements: [],
  schedules: [],
  users: [],
  telegramStatus: null,
  notificationLogs: [],
};

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  const handleQuickLogin = async (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setLoading(true);
    setError("");
    try {
      const response = await adminApi<LoginResponse>("/auth/login", undefined, {
        method: "POST",
        body: JSON.stringify({ username: demoUser, password: demoPass }),
      });
      await loadDashboard(response.token);
      sessionStorage.setItem("drivex_admin_token", response.token);
      setToken(response.token);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = useCallback(async (authToken: string) => {
    const session = await adminApi<AdminSession>("/admin/me", authToken);
    const isSuperAdmin = session.role === "SUPER_ADMIN";
    const branchQuery = !isSuperAdmin && session.branch_id
      ? `?branch_id=${encodeURIComponent(session.branch_id)}`
      : "";
    const requests = [
      adminApi<ApiList<Branch>>("/branches"),
      adminApi<ApiList<Product>>("/products"),
      adminApi<ApiList<BranchInventoryItem>>(`/admin/inventory${branchQuery}`, authToken),
      session.role !== "STAFF"
        ? adminApi<ApiList<StockTransfer>>(`/admin/inventory/transfers${branchQuery}`, authToken)
        : Promise.resolve({ data: [] as StockTransfer[] }),
      adminApi<ApiList<StockMovement>>(`/admin/inventory/history${branchQuery}`, authToken),
      isSuperAdmin || session.role === "BRANCH_ADMIN"
        ? adminApi<ApiList<Order>>(`/admin/orders${branchQuery}`, authToken)
        : Promise.resolve({ data: [] as Order[] }),
      isSuperAdmin || session.role === "BRANCH_ADMIN"
        ? adminApi<ApiList<TradeInRequest>>(`/admin/trade-in${branchQuery}`, authToken)
        : Promise.resolve({ data: [] as TradeInRequest[] }),
      isSuperAdmin || session.role === "BRANCH_ADMIN"
        ? adminApi<ApiList<InstallmentApplication>>(`/admin/installments${branchQuery}`, authToken)
        : Promise.resolve({ data: [] as InstallmentApplication[] }),
      isSuperAdmin || session.role === "BRANCH_ADMIN"
        ? adminApi<ApiList<InstallmentPaymentSchedule>>(`/admin/installment-schedules${branchQuery}`, authToken)
        : Promise.resolve({ data: [] as InstallmentPaymentSchedule[] }),
      isSuperAdmin
        ? adminApi<ApiList<AdminUser>>("/admin/users", authToken)
        : Promise.resolve({ data: [] as AdminUser[] }),
      isSuperAdmin
        ? adminApi<{ data: TelegramStatus }>("/admin/telegram/status", authToken)
        : Promise.resolve({ data: null as TelegramStatus | null }),
      isSuperAdmin
        ? adminApi<ApiList<NotificationLog>>("/admin/telegram/logs", authToken)
        : Promise.resolve({ data: [] as NotificationLog[] }),
    ] as const;
    const [
      branches,
      products,
      inventory,
      transfers,
      movements,
      orders,
      tradeIns,
      installments,
      schedules,
      users,
      telegramStatus,
      notificationLogs,
    ] =
      await Promise.all(requests);

    setAdmin(session);
    setDashboard({
      branches: branches?.data ?? [],
      products: products?.data ?? [],
      inventory: inventory?.data ?? [],
      orders: orders?.data ?? [],
      tradeIns: tradeIns?.data ?? [],
      installments: installments?.data ?? [],
      transfers: transfers?.data ?? [],
      movements: movements?.data ?? [],
      schedules: schedules?.data ?? [],
      users: users?.data ?? [],
      telegramStatus: telegramStatus?.data ?? null,
      notificationLogs: notificationLogs?.data ?? [],
    });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const storedToken = sessionStorage.getItem("drivex_admin_token");
      if (!storedToken) {
        setCheckingSession(false);
        return;
      }
      try {
        await loadDashboard(storedToken);
        setToken(storedToken);
      } catch {
        sessionStorage.removeItem("drivex_admin_token");
      } finally {
        setCheckingSession(false);
      }
    });
  }, [loadDashboard]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await adminApi<LoginResponse>("/auth/login", undefined, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await loadDashboard(response.token);
      sessionStorage.setItem("drivex_admin_token", response.token);
      setToken(response.token);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("drivex_admin_token");
    setToken(null);
    setAdmin(null);
    setDashboard(emptyDashboard);
    router.push("/");
  };

  if (checkingSession || (loading && !token)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Loading Admin Portal...</p>
      </main>
    );
  }

  if (token && admin) {
    return (
      <div className="h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <AdminDashboard
          {...dashboard}
          token={token}
          currentRole={admin.role}
          currentUserID={admin.id}
          assignedBranchID={admin.branch_id}
          onExitAdmin={handleLogout}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 sm:p-6 md:p-10 antialiased">
      <div className="w-full max-w-5xl rounded-[28px] overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200/90 grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
        {/* Left Column: Dark Fluid Wave Aesthetics (shadcn luxury style) */}
        <div className="relative bg-[#09090b] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          {/* Fluid Silk/Metallic 3D Wave SVG Background */}
          <svg
            viewBox="0 0 600 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-85"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.5" />
                <stop offset="35%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="sheen1" x1="0%" y1="30%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0" />
                <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sheen2" x1="100%" y1="20%" x2="0%" y2="80%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0" />
                <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="waveGrad3" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#090d16" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#1e293b" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
              </linearGradient>
              <radialGradient id="spotGlow" cx="30%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Tone */}
            <rect width="600" height="800" fill="#090a0f" />
            <circle cx="200" cy="300" r="350" fill="url(#spotGlow)" />

            {/* Fluid Wave Ribbons */}
            <path
              d="M 600,0 C 450,150 250,220 180,380 C 110,540 180,680 150,800 L 0,800 L 0,0 Z"
              fill="url(#waveGrad1)"
            />
            <path
              d="M 600,0 C 450,150 250,220 180,380 C 110,540 180,680 150,800"
              stroke="url(#sheen1)"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M 600,120 C 400,280 220,320 140,500 C 80,640 120,720 80,800 L 600,800 Z"
              fill="url(#waveGrad2)"
            />
            <path
              d="M 600,120 C 400,280 220,320 140,500 C 80,640 120,720 80,800"
              stroke="url(#sheen2)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 450,0 C 320,180 160,280 120,440 C 70,640 130,730 60,800 L 0,800 L 0,0 Z"
              fill="url(#waveGrad3)"
              opacity="0.85"
            />
            <path
              d="M 520,0 C 380,180 220,290 160,460 C 110,610 140,710 100,800"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 400,0 C 280,210 170,340 130,510 C 90,670 110,750 70,800"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M 600,280 C 420,420 280,520 240,680 C 210,760 220,780 200,800"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Top Branding */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo-dark.png" 
                alt="AUTO CAR" 
                className="h-10 w-auto object-contain drop-shadow-sm" 
              />
              <div>
                <span className="text-base font-bold tracking-tight text-white block">Enterprise Hub</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Auto Car Admin</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              v2.4 Admin
            </span>
          </div>

          {/* Bottom Testimonial / Quote */}
          <div className="relative z-10 mt-auto pt-16">
            <blockquote className="space-y-3">
              <p className="text-sm font-normal text-slate-300 leading-relaxed">
                &ldquo;DriveX Automotive Management Portal ensures enterprise-grade multi-branch vehicle inventory tracking, real-time financing operations, and seamless showroom logistics across Cambodia.&rdquo;
              </p>
              <footer className="pt-2">
                <div className="text-sm font-semibold text-white tracking-tight">DriveX Executive Operations</div>
                <div className="text-xs text-slate-400">Phnom Penh &bull; Siem Reap &bull; Battambang Showrooms</div>
              </footer>
            </blockquote>

            <div className="mt-5 pt-4 border-t border-white/10">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors group"
              >
                <span>Visit Customer Showroom</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Authentication Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white relative">
          {/* Top navigation link */}
          <div className="flex justify-end mb-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors flex items-center gap-1"
            >
              <span>&larr; Back to Showroom</span>
            </Link>
          </div>

          {/* Centered Sign In Content */}
          <div className="w-full max-w-sm mx-auto my-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
                Sign in to your account
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                ចូលគ្រប់គ្រងប្រព័ន្ធ Admin Showroom
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Enter your email or username below to access your desk
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="admin-username">
                  Email or Username
                </label>
                <input
                  id="admin-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="name@drivex.com or username"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700" htmlFor="admin-password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#18181b] hover:bg-black text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />
                    <span>Sign in with Email</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider text-[11px]">
                  OR QUICK DEMO ACCOUNTS
                </span>
              </div>
            </div>

            {/* Quick Demo Role Accounts (Mirroring GitHub / Google in reference photo) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("superadmin", "admin123")}
                disabled={loading}
                className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-lg py-2.5 px-3.5 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-900">Super Administrator (HQ)</span>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                  Full Access
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("pp_manager", "admin123")}
                disabled={loading}
                className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-lg py-2.5 px-3.5 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-900">Branch Manager (Phnom Penh)</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  Showroom Desk
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("staff_dara", "admin123")}
                disabled={loading}
                className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-lg py-2.5 px-3.5 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-900">Sales Consultant (Staff Dara)</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  Inventory & Sales
                </span>
              </button>
            </div>

            {/* Terms & Privacy Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-6">
              By clicking sign in, you agree to our{" "}
              <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Bottom Branding Mark */}
          <div className="mt-6 flex items-center justify-end gap-1.5 text-xs text-slate-400">
            <span>presented by</span>
            <span className="font-bold tracking-tight text-slate-800 flex items-center gap-1">
              <Car className="h-3.5 w-3.5 text-blue-600" /> DriveX
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
