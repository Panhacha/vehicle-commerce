"use client";

import React, { useState, useMemo } from "react";
import { Product, Category, Branch } from "./types";
import { 
  Users, 
  Briefcase,
  Gauge, 
  ArrowRight,
  Search,
  Calendar,
  Key,
  ShieldCheck,
  RotateCcw,
  Star,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Smartphone,
  Download,
  Car
} from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";

interface ShowroomProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedBranch: Branch | null;
  onOpenLoanModalWithProduct: (product: Product) => void;
  onOpenTradeInModalWithProduct?: (product: Product) => void;
  onOpenOrderModalWithProduct: (product: Product) => void;
  onInspectProduct?: (product: Product) => void;
  selectedBrand?: string;
  onSelectBrand?: (brandName: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Showroom: React.FC<ShowroomProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedBranch,
  onOpenLoanModalWithProduct,
  onOpenTradeInModalWithProduct,
  onOpenOrderModalWithProduct,
  onInspectProduct,
  selectedBrand = "all",
  searchQuery = "",
  onSearchChange,
}) => {
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const [activeDealFilter, setActiveDealFilter] = useState<string>("ALL");

  const handleOrderClick = (product: Product) => {
    if (!isLoggedIn) {
      openAuthModal(
        () => onOpenOrderModalWithProduct(product),
        `សូមចូលគណនី ឬចុះឈ្មោះជាមុនសិន ដើម្បីធ្វើការកក់រថយន្ត ${product.name}!`
      );
    } else {
      onOpenOrderModalWithProduct(product);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory && selectedCategory !== "all") {
        if (selectedCategory === "toyota") {
          const isToyota =
            p.brand?.toLowerCase() === "toyota" ||
            p.category_id === "cat-toyota" ||
            p.name.toLowerCase().includes("toyota");
          if (!isToyota) return false;
        } else {
          const catObj = categories.find((c) => c.slug === selectedCategory);
          if (catObj && catObj.type !== "ALL") {
            const matches = p.category_type === catObj.type || p.category_id === catObj.id;
            if (!matches) return false;
          }
        }
      }

      // Deal filter
      if (activeDealFilter === "HYBRID") {
        if (!p.top_label?.includes("Hybrid")) return false;
      } else if (activeDealFilter === "EV") {
        if (!p.top_label?.includes("Battery EV")) return false;
      } else if (activeDealFilter === "SUV") {
        if (!p.specs?.["Seating"] || Number(p.specs?.["Seating"]) < 5) return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [products, categories, selectedCategory, activeDealFilter, searchQuery]);

  // Customer Reviews
  const reviews = [
    {
      id: "r1",
      name: "Sokha Chen (ភ្នំពេញ)",
      role: "Business Owner",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      quote: "សេវាកម្មទិញរថយន្ត Toyota 2026 នៅទីនេះពិតជាលឿន និងច្បាស់លាស់។ ការបង់រំលោះតាម Bakong KHQR ងាយស្រួល មិនទាមទារឯកសារស្មុគស្មាញឡើយ!",
      car: "Toyota Land Cruiser 2027",
    },
    {
      id: "r2",
      name: "Sarah Lim (សៀមរាប)",
      role: "Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      quote: "Easy trade-in appraisal. I swapped my old vehicle for a brand new Camry Hybrid seamlessly within 48 hours. Highly recommended!",
      car: "Toyota Camry Hybrid",
    },
    {
      id: "r3",
      name: "Michael Tan (បាត់ដំបង)",
      role: "Managing Director",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      quote: "Transparent pricing without any hidden fees. Staff is very professional and helpful. Will definitely buy our next fleet from VehicleHub.",
      car: "Toyota 4Runner i-FORCE",
    },
  ];

  return (
    <section id="showroom" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP DEALS SHOWROOM (Matching DriveX "TOP DEALS" Grid)                   */}
      {/* ========================================================================= */}
      <div id="top-deals">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              TOP DEALS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Popular 2026-2027 models with special promotion pricing & low financing rates
            </p>
          </div>

          {/* Deal Filters & View All */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: "ALL", label: "All Deals" },
              { id: "HYBRID", label: "Hybrid EV" },
              { id: "EV", label: "Battery EV" },
              { id: "SUV", label: "SUVs & Trucks" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveDealFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDealFilter === f.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Column Clean Car Cards Grid (Matching DriveX) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700">No vehicles match your criteria</h3>
            <button
              onClick={() => {
                setActiveDealFilter("ALL");
                onSelectCategory("all");
                if (onSearchChange) onSearchChange("");
              }}
              className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProducts.slice(0, 15).map((product) => {
              const estDaily = Math.round(product.base_price / 700);
              const estMonthly = Math.round((product.base_price * 0.8) / 60);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 p-3.5 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Golden Yellow Deal Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        {product.top_label ? product.top_label.split(" ")[0] : "10% OFF"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {product.year || 2026}
                      </span>
                    </div>

                    {/* Vehicle Image */}
                    <div 
                      onClick={() => onInspectProduct?.(product)}
                      className="h-32 flex items-center justify-center p-1 cursor-pointer"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder-car.png"}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Title & Brand */}
                    <div className="mt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {product.brand}
                      </div>
                      <h3 
                        onClick={() => onInspectProduct?.(product)}
                        className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate cursor-pointer mt-0.5"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                    </div>

                    {/* Specs Line */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                      {product.seating && (
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{product.seating} Seats</span>
                        </span>
                      )}
                      {product.mpg_range && (
                        <span>• {product.mpg_range.split(" ")[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div>
                        <div className="text-base font-black text-slate-900">
                          ${product.base_price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~${estMonthly}/mo loan
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-amber-500">
                          ${estDaily} <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                        </span>
                      </div>
                    </div>

                    {/* Clean Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onInspectProduct?.(product)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOrderClick(product)}
                        className="py-1.5 px-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black text-center transition-colors cursor-pointer shadow-2xs"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. HOW IT WORKS (5 Connected Process Steps matching DriveX)                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center">
        
        <div className="max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            HOW IT WORKS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Easy and transparent 5-step process to purchase, finance, or trade-in your car
          </p>
        </div>

        {/* 5 Process Step Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-500 flex items-center justify-center font-black text-lg shadow-sm">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">1. Search & Choose</h4>
            <p className="text-xs text-slate-500 leading-snug">
              Choose location, brand, model & financing plan.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-500 flex items-center justify-center font-black text-lg shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">2. Book & Order</h4>
            <p className="text-xs text-slate-500 leading-snug">
              Select terms, submit loan or reserve vehicle online.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-500 flex items-center justify-center font-black text-lg shadow-sm">
              <Key className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">3. Pick Up / Test Drive</h4>
            <p className="text-xs text-slate-500 leading-snug">
              Inspect vehicle at showroom or door-step delivery.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-500 flex items-center justify-center font-black text-lg shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">4. Drive & Enjoy</h4>
            <p className="text-xs text-slate-500 leading-snug">
              Enjoy your ride with 100% official factory warranty.
            </p>
          </div>

          {/* Step 5 - Trade-In Interactive Action */}
          <div 
            onClick={() => onOpenTradeInModalWithProduct?.(products[0])}
            className="flex flex-col items-center space-y-2 p-2 rounded-2xl hover:bg-amber-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
            title="ចុចដើម្បីបើកផ្ទាំងវាយប្តូររថយន្តចាស់ (Trade-In)"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-500 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">5. Support & Trade-In</h4>
            <p className="text-xs text-slate-500 leading-snug">
              Maintenance support, resale or instant trade-in anytime.
            </p>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              វាយតម្លៃឡានចាស់ →
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. WHAT OUR CUSTOMERS SAY & APP/QR DOWNLOAD (Matching DriveX Layout)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left 8 Cols: Customer Reviews */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">
              WHAT OUR CUSTOMERS SAY
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
              Verified reviews from customers across Cambodia
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* 5 Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-200/60">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">{rev.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{rev.car}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Download App & Bakong QR Card (Dark Card matching DriveX) */}
        <div className="lg:col-span-4 bg-[#111827] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10 space-y-3">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
              Seamless Mobile & QR
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Instant Booking & KHQR
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scan with Bakong KHQR for instant vehicle reservation or follow notifications via Telegram bot.
            </p>

            {/* Badges / Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <span>🤖 Telegram Showroom Concierge</span>
              </a>

              <button
                onClick={() => {
                  const el = document.getElementById("top-deals");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Explore Mobile Showroom</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Official Bakong KHQR Enabled</span>
            <span className="text-emerald-400 font-bold">● Active 24/7</span>
          </div>
        </div>

      </div>

    </section>
  );
};
