"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Hero 
} from "@/components/Hero";
import { 
  MOCK_BRANCHES, 
  MOCK_PRODUCTS
} from "@/components/mockData";
import { Branch, Product } from "@/components/types";
import { LoanCalculatorModal } from "@/components/LoanCalculatorModal";
import { TradeInModal } from "@/components/TradeInModal";
import { ColorStudioModal } from "@/components/ColorStudioModal";
import { 
  Car, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  Award, 
  Sliders, 
  RotateCcw, 
  Fuel, 
  Users, 
  Gauge, 
  ChevronRight,
  Eye,
  Check,
  Compass,
  Truck,
  Zap,
  BadgeCheck,
  Wrench,
  BadgePercent,
  ArrowLeftRight
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

export default function Home() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(MOCK_BRANCHES[0]);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Modals state
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanProduct, setLoanProduct] = useState<Product | null>(null);

  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [tradeInTargetProduct, setTradeInTargetProduct] = useState<Product | null>(null);

  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [studioProduct, setStudioProduct] = useState<Product | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("vehiclehub_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
    }

    // Fetch live products from backend & Supabase DB
    let active = true;
    fetch(`${API_BASE}/products`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const merged = json.data.map((lp: any) => {
            const m = MOCK_PRODUCTS.find((p) => p.sku === lp.sku || p.id === lp.id);
            return {
              ...m,
              ...lp,
              images: Array.isArray(lp.images) ? lp.images : m?.images || ["/angles/suv_34.jpg"],
              base_price: Number(lp.base_price) || m?.base_price || 35000,
              mpg_range: lp.mpg_range || m?.mpg_range || "24/30 MPG",
              seating: lp.seating || m?.seating || 5,
            };
          });
          setLiveProducts(merged);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Listen for global navbar modal events (Loan Calculator & Trade-in)
  useEffect(() => {
    const handleOpenLoan = () => {
      setLoanProduct(null);
      setIsLoanModalOpen(true);
    };
    const handleOpenTradeIn = () => {
      setTradeInTargetProduct(null);
      setIsTradeInModalOpen(true);
    };
    window.addEventListener("open-loan-modal", handleOpenLoan);
    window.addEventListener("open-tradein-modal", handleOpenTradeIn);
    return () => {
      window.removeEventListener("open-loan-modal", handleOpenLoan);
      window.removeEventListener("open-tradein-modal", handleOpenTradeIn);
    };
  }, []);

  // Curated 4 Flagship Trending Models for the Home page
  const featuredFlagships = useMemo(() => {
    return [
      liveProducts.find(p => p.sku?.includes("LC") || p.id.includes("landcruiser")) || liveProducts[0],
      liveProducts.find(p => p.sku?.includes("4RN") || p.id.includes("4runner")) || liveProducts[1],
      liveProducts.find(p => p.sku?.includes("CAM") || p.id.includes("camry")) || liveProducts[2],
      liveProducts.find(p => p.sku?.includes("TACOMA") || p.id.includes("tacoma")) || liveProducts[3],
    ].filter(Boolean);
  }, [liveProducts]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors`}>
      <div>
        <main>
          
          {/* 1. SCENIC HERO SECTION (Interactive Search & Direct Link to Shop) */}
          <Hero
            branches={MOCK_BRANCHES}
            selectedBranch={selectedBranch}
            onSelectBranch={(b) => setSelectedBranch(b)}
            onScrollToShowroom={() => router.push("/shop")}
          />

          {/* 2. FLAGSHIP & TRENDING MODELS (Only 4 Curated Show-Stoppers) */}
          <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  រថយន្តឆ្នើមប្រចាំឆ្នាំ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-medium">
                  ម៉ូដែលទំនើបចុងក្រោយ ទទួលបានការពេញនិយម និងមានការកក់ទុកច្រើនជាងគេបំផុត
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-slate-950 dark:hover:text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm group shrink-0"
              >
                <span>មើលរថយន្តទាំងអស់ក្នុង Shop (33+ ម៉ូឌែល)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 4 Flagship Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFlagships.map((car) => {
                if (!car) return null;
                return (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {car.brand} • {car.year}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase">
                          ★ ឆ្នើម
                        </span>
                      </div>

                      {/* Studio Car Image */}
                      <div className="w-full h-44 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/40 dark:from-slate-800/40 dark:via-slate-900/60 dark:to-slate-950 flex items-center justify-center p-3 relative overflow-hidden group">
                        <img
                          src={car.images?.[0] || "/angles/suv_34.jpg"}
                          alt={car.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 filter drop-shadow-md"
                          onError={(e: any) => {
                            e.target.src = "/angles/suv_34.jpg";
                          }}
                        />
                      </div>

                      {/* Car Details */}
                      <div className="mt-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                          {car.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {car.body_type || "SUV"} • {car.top_label || "Official Model"}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{car.mpg_range || "26 MPG"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{car.seating || 5} កៅអី</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Direct CTA */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="mb-3">
                        <span className="text-[10px] text-slate-400 block font-medium">តម្លៃយានយន្តផ្លូវការ</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                          ${car.base_price.toLocaleString()} <span className="text-xs font-bold text-slate-400">USD</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStudioProduct(car);
                            setIsStudioModalOpen(true);
                          }}
                          className="py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>មើលពណ៌</span>
                        </button>

                        <Link
                          href={`/checkout?id=${car.id}`}
                          className="py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition-colors text-center shadow-xs"
                        >
                          <span>កក់រថយន្ត</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Big Prominent Banner Inviting to Shop */}
            <div className="mt-12 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 text-white p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  COMPLETE 2026 INVENTORY
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  ស្វែងរករថយន្តគ្រប់ប្រភេទនៅក្នុង Shop ផ្លូវការ
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  មានជម្រើសច្រើនជាង ៣៣+ ម៉ូឌែល៖ SUV, Luxury Sedans, Heavy Pickups, All-Electric EVs ជាមួយជម្រើសពណ៌រោងចក្រ និងការបង់រំលស់ការប្រាក់ទាប
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                <Link
                  href="/shop"
                  className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base transition-all shadow-lg shadow-amber-400/20 inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span>ចូលទៅកាន់ Shop ឥឡូវនេះ</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>

          </section>

          {/* 3. EXPLORE BY BODY TYPE (ភេទនៃឡាន) */}
          <section className="py-16 sm:py-20 bg-white dark:bg-[#070b14] border-y border-slate-200/80 dark:border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase text-amber-500 tracking-wider">
                  VEHICLE CATEGORIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                  រុករកតាមប្រភេទរថយន្ត (Body Types)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                  ជ្រើសរើសប្រភេទរថយន្តដែលត្រូវនឹងតម្រូវការ និងរបៀបរស់នៅរបស់អ្នក
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. SUV */}
                <Link
                  href="/shop?category=suv"
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Compass className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors tracking-tight">
                      SUV & Crossover
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      សាកសមសម្រាប់គ្រួសារ ការធ្វើដំណើរផ្លូវឆ្ងាយ និងទូលាយផាសុកភាព
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <span>14 ម៉ូឌែលក្នុងស្តុក</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>

                {/* 2. Sedan */}
                <Link
                  href="/shop?category=sedan"
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Gauge className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors tracking-tight">
                      Sedan & Sport
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      ប្រណិត ស្ងប់ស្ងាត់ សន្សំសំចៃប្រេងខ្ពស់ និងភាពទាន់សម័យ
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <span>8 ម៉ូឌែលក្នុងស្តុក</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>

                {/* 3. Truck */}
                <Link
                  href="/shop?category=truck"
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Truck className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors tracking-tight">
                      Truck & Pickup
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      កម្លាំងម៉ាស៊ីនខ្លាំង ផ្ទុកទម្ងន់ធ្ងន់ និងជំនាញផ្លូវលំបាក Off-Road
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <span>4 ម៉ូឌែលក្នុងស្តុក</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>

                {/* 4. EV */}
                <Link
                  href="/shop?category=ev"
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Zap className="w-7 h-7 stroke-[2.2] fill-emerald-500/20" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors tracking-tight">
                      Electric & Hybrid
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      បច្ចេកវិទ្យាអនាគត សន្សំសំចៃថាមពលខ្ពស់ និងគ្មានការបំភាយផ្សែង
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <span>7 ម៉ូឌែលក្នុងស្តុក</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>

              </div>

            </div>
          </section>

          {/* 4. WHY CHOOSE AUTO CAR (គុណសម្បត្តិលេចធ្លោ & ទំនុកចិត្ត) */}
          <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase text-amber-500 tracking-wider">
                PEACE OF MIND GUARANTEE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                ហេតុអ្វីអតិថិជនជឿជាក់លើ Auto Car?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                ផ្តល់ជូននូវបទពិសោធន៍ទិញ និងកក់រថយន្តប្រកបដោយទំនុកចិត្ត និងសុវត្ថិភាពខ្ពស់បំផុត
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center font-black mb-4 shadow-2xs">
                    <BadgeCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    ធានាប្រាក់កក់ 100%
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                    ធានាសងប្រាក់កក់វិញ ១០០% ដោយគ្មានលក្ខខណ្ឌ ប្រសិនបើលោកអ្នកមិនពេញចិត្តពេលពិនិត្យរថយន្តជាក់ស្តែង។
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center font-black mb-4 shadow-2xs">
                    <Wrench className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    ការធានាផ្លូវការ ៣ ឆ្នាំ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                    ការធានាគុណភាពផ្លូវការ ៣ ឆ្នាំ ឬ ១០០,០០០ គ.ម ពីរោងចក្រផ្ទាល់ ព្រមទាំងសេវាថែទាំឥតគិតថ្លៃ។
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center font-black mb-4 shadow-2xs">
                    <BadgePercent className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    បង់រំលស់ការប្រាក់ទាប
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                    គាំទ្រកម្ចីរថយន្តជាមួយធនាគារដៃគូ ការប្រាក់ទាបត្រឹម 8.5%/ឆ្នាំ រំលស់រហូតដល់ ៧២ ខែ អនុម័តក្នុង ២៤ ម៉ោង។
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center font-black mb-4 shadow-2xs">
                    <ArrowLeftRight className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    វាយតម្លៃប្តូរឡានចាស់ (Trade-in)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                    វាយតម្លៃរថយន្តចាស់របស់អ្នកក្នុងរយៈពេល ២០ នាទីនៅ Showroom ដើម្បីកាត់កងប្រាក់កក់ទិញឡានថ្មីភ្លាមៗ។
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* 5. SHOWROOM BRANCHES (សាខាទូទាំងប្រទេស) */}
          <section id="locations" className="py-16 bg-white dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase text-amber-500 tracking-wider">
                  NATIONWIDE SHOWROOMS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                  សាខា Showroom បង្ហាញរថយន្តផ្លូវការ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  ស្វាគមន៍ការមកទស្សនា និងសាកល្បងបើកបរជាក់ស្តែងរាល់ថ្ងៃ ពីម៉ោង 8:00 AM - 7:30 PM
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_BRANCHES.map((b) => (
                  <div
                    key={b.id}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                        បើកដំណើរការ
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {b.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{b.address}, {b.city}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>{b.phone}</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">8:00 AM - 7:30 PM</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

        </main>
      </div>

      {/* Modals */}
      <LoanCalculatorModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        initialProduct={loanProduct}
        branches={MOCK_BRANCHES}
      />

      <TradeInModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        targetProduct={tradeInTargetProduct}
        products={MOCK_PRODUCTS}
        branches={MOCK_BRANCHES}
      />

      <ColorStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => {
          setIsStudioModalOpen(false);
          setStudioProduct(null);
        }}
        product={studioProduct}
        selectedBranch={selectedBranch}
        onOpenOrderModal={(product) => {
          router.push(`/checkout?id=${product.id}`);
        }}
        onOpenLoanModal={(product) => {
          setLoanProduct(product);
          setIsLoanModalOpen(true);
        }}
        onOpenTradeInModal={(product) => {
          setTradeInTargetProduct(product);
          setIsTradeInModalOpen(true);
        }}
      />

      {/* Clean DriveX Footer */}
      <footer id="footer-contact" className="bg-[#090d16] text-white border-t border-slate-800 pt-14 pb-8 transition-colors select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-xs sm:text-sm">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo-dark.png" 
                alt="AUTO CAR" 
                className="h-12 w-auto object-contain drop-shadow-sm" 
              />
            </div>
            <p className="text-slate-400 max-w-sm text-xs sm:text-sm leading-relaxed">
              DriveX Cambodia • Official Vehicle Showroom, Multi-Branch Fleet Management & Flexible Installment Financing across Phnom Penh, Siem Reap, and Battambang.
            </p>
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span>✉️ support@drivex-cambodia.com</span>
              <span>•</span>
              <span>📞 +855 23 888 999</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
              <li><Link href="/" className="hover:text-amber-400">Home (ទំព័រដើម)</Link></li>
              <li><Link href="/shop" className="hover:text-amber-400 font-bold text-white">Shop រថយន្តទាំងអស់ (33+)</Link></li>
              <li><Link href="/checkout" className="hover:text-amber-400">កក់រថយន្ត & My Booking</Link></li>
              <li><Link href="/sitemap" className="hover:text-amber-400">Sitemap (ផែនទី)</Link></li>
              <li><Link href="/admin" className="hover:text-purple-400">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">OUR SERVICES</h4>
            <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
              <li>• Instant Bakong KHQR Pay</li>
              <li>• Low Interest Loans 12-72 Months</li>
              <li>• Trade-in Appraisal & Resell</li>
              <li>• Official Factory Warranty</li>
              <li>• Nationwide Delivery</li>
            </ul>
          </div>

          {/* Top Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">SHOWROOMS</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div>
                <strong className="text-white block">Phnom Penh Main HQ:</strong>
                Preah Monivong Blvd, BKK1
              </div>
              <div>
                <strong className="text-white block">Siem Reap Heritage:</strong>
                National Road 6, Svay Dangkum
              </div>
              <div>
                <strong className="text-white block">Battambang Regional:</strong>
                Street 106, Svay Por
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 DriveX Automotive. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Bakong KHQR Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
