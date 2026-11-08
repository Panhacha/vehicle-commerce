"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Car, 
  Zap, 
  Bike, 
  Wrench, 
  Compass,
  Gauge,
  Truck,
  Users,
  RotateCcw,
  Play,
  Pause
} from "lucide-react";
import { Product } from "./types";
import {
  MarqueeConfig,
  CategoryItem,
  BrandItem,
  ICON_OPTIONS,
  DEFAULT_MARQUEE_CONFIG,
  fetchServerMarqueeConfig,
  getStoredMarqueeConfig
} from "./marqueeConfig";

export interface CategoryBrandCarouselProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  products: Product[];
  className?: string;
  darkVariant?: boolean;
}

// Crisp, clean vector SVG brand marks
const getBrandLogo = (brandId: string, isSelected: boolean, darkVariant: boolean) => {
  const adaptiveColor = isSelected ? "#020617" : darkVariant ? "#f8fafc" : "#0f172a";

  switch (brandId) {
    case "Toyota":
      return (
        <svg viewBox="0 0 100 65" className="w-6.5 h-4.5 fill-red-600">
          <ellipse cx="50" cy="32.5" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="6" />
          <ellipse cx="50" cy="30" rx="18" ry="24" fill="none" stroke="currentColor" strokeWidth="5" />
          <ellipse cx="50" cy="20" rx="32" ry="12" fill="none" stroke="currentColor" strokeWidth="5" />
        </svg>
      );
    case "Hyundai":
      return (
        <svg viewBox="0 0 100 60" className="w-6.5 h-4.5 fill-blue-600">
          <ellipse cx="50" cy="30" rx="45" ry="26" fill="none" stroke="currentColor" strokeWidth="5.5" />
          <path d="M 33 46 L 41 14 L 48 14 L 44 28 L 56 28 L 60 14 L 67 14 L 59 46 L 52 46 L 55 33 L 43 33 L 40 46 Z" />
        </svg>
      );
    case "Kia":
      return (
        <svg viewBox="0 0 100 45" className="w-6.5 h-4 fill-red-600">
          <ellipse cx="50" cy="22.5" rx="46" ry="20" fill="none" stroke="currentColor" strokeWidth="5" />
          <text x="50" y="31" textAnchor="middle" fontSize="26" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
            KIA
          </text>
        </svg>
      );
    case "BYD":
      return (
        <svg viewBox="0 0 100 45" className="w-6.5 h-4" style={{ fill: adaptiveColor }}>
          <ellipse cx="50" cy="22.5" rx="47" ry="20" fill="none" stroke={adaptiveColor} strokeWidth="4.5" />
          <text x="50" y="30" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.5">
            BYD
          </text>
        </svg>
      );
    case "Ford":
      return (
        <svg viewBox="0 0 100 50" className="w-6.5 h-4.5">
          <ellipse cx="50" cy="25" rx="46" ry="23" fill="#003478" />
          <ellipse cx="50" cy="25" rx="43" ry="20" fill="none" stroke="#ffffff" strokeWidth="2" />
          <text x="50" y="33" textAnchor="middle" fontSize="23" fontWeight="bold" fontStyle="italic" fill="#ffffff" fontFamily="serif">
            Ford
          </text>
        </svg>
      );
    case "Lexus":
      return (
        <svg viewBox="0 0 100 60" className="w-6 h-4.5 fill-none" style={{ stroke: adaptiveColor }}>
          <ellipse cx="50" cy="30" rx="45" ry="26" strokeWidth="5.5" />
          <path d="M 32 18 L 32 42 L 68 42 L 68 34 L 42 34 L 64 20" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Tesla":
      return (
        <svg viewBox="0 0 100 65" className="w-5.5 h-4.5 fill-red-600">
          <path d="M 12 18 C 30 13, 70 13, 88 18 C 76 25, 58 26, 50 36 C 42 26, 24 25, 12 18 Z" />
          <path d="M 45 42 L 55 42 L 53 66 C 51 68, 49 68, 47 66 Z" />
          <path d="M 15 10 C 35 6, 65 6, 85 10 L 88 14 C 66 10, 34 10, 12 14 Z" />
        </svg>
      );
    case "Peugeot":
      return (
        <svg viewBox="0 0 100 80" className="w-5 h-5 fill-blue-600">
          <path d="M 50 10 C 65 10 75 18 78 30 C 72 32 68 35 68 40 C 68 46 72 48 76 52 C 70 56 65 58 60 58 C 55 58 52 52 48 52 C 45 52 42 56 38 56 C 32 56 26 50 26 42 C 26 32 35 15 50 10 Z" />
          <path d="M 38 60 L 45 74 L 55 74 L 52 64 L 62 74 L 72 74 L 60 58 Z" />
        </svg>
      );
    case "BMW":
      return (
        <svg viewBox="0 0 100 100" className="w-5 h-5">
          <circle cx="50" cy="50" r="46" fill="#000000" stroke="#cccccc" strokeWidth="3" />
          <circle cx="50" cy="50" r="34" fill="#ffffff" />
          <path d="M 50 16 A 34 34 0 0 1 84 50 L 50 50 Z" fill="#0066b1" />
          <path d="M 50 50 L 16 50 A 34 34 0 0 1 50 84 Z" fill="#0066b1" />
          <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">B M W</text>
        </svg>
      );
    case "Mercedes-Benz":
      return (
        <svg viewBox="0 0 100 100" className="w-5 h-5 fill-none" style={{ stroke: adaptiveColor }} strokeWidth="5.5">
          <circle cx="50" cy="50" r="44" />
          <line x1="50" y1="50" x2="50" y2="8" strokeWidth="6" />
          <line x1="50" y1="50" x2="14" y2="72" strokeWidth="6" />
          <line x1="50" y1="50" x2="86" y2="72" strokeWidth="6" />
        </svg>
      );
    default:
      return (
        <span className="text-xs font-black truncate" style={{ color: adaptiveColor }}>
          {brandId.slice(0, 3)}
        </span>
      );
  }
};

// Dynamic Category Icon Resolver from ICON_OPTIONS registry
const getCategoryIcon = (key: string, isSelected: boolean) => {
  const baseClass = "w-4.5 h-4.5 shrink-0";
  const iconColor = isSelected ? "text-slate-950" : "";

  const found = ICON_OPTIONS.find((o) => o.key.toLowerCase() === key.toLowerCase());
  if (found) {
    const Component = found.icon;
    let colorClass = isSelected ? iconColor : "text-amber-500";
    if (!isSelected) {
      if (key === "suv") colorClass = "text-blue-500";
      else if (key === "sedan") colorClass = "text-indigo-500";
      else if (key === "truck") colorClass = "text-rose-500";
      else if (key === "ev") colorClass = "text-emerald-500 fill-emerald-500";
      else if (key === "minivan") colorClass = "text-purple-500";
      else if (key === "ebike") colorClass = "text-cyan-500";
      else if (key === "parts") colorClass = "text-amber-500";
      else if (key === "flame") colorClass = "text-orange-500";
      else if (key === "shield") colorClass = "text-blue-600";
      else if (key === "trophy") colorClass = "text-amber-400";
    }
    return <Component className={`${baseClass} ${colorClass}`} />;
  }

  return <Car className={`${baseClass} ${isSelected ? iconColor : "text-amber-500"}`} />;
};

export const CategoryBrandCarousel: React.FC<CategoryBrandCarouselProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  products,
  className = "",
  darkVariant = false,
}) => {
  const [activeTab, setActiveTab] = useState<"dual" | "category" | "brand">("dual");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [config, setConfig] = useState<MarqueeConfig>(DEFAULT_MARQUEE_CONFIG);

  // Load config on mount & listen for live cross-tab updates
  useEffect(() => {
    const applyConfig = (newCfg?: MarqueeConfig) => {
      if (newCfg && Array.isArray(newCfg.categories) && newCfg.categories.length > 0) {
        setConfig(newCfg);
      } else {
        const local = getStoredMarqueeConfig();
        setConfig(local);
      }
    };

    // 1. Initial load from local cache & server
    applyConfig();
    void fetchServerMarqueeConfig().then((data) => {
      if (data) applyConfig(data);
    });

    // 2. Same-window custom event
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        applyConfig(e.detail);
      } else {
        applyConfig();
      }
    };
    window.addEventListener("marquee_config_updated", handleUpdate);

    // 3. Cross-tab storage event (localStorage changed by another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "drivex_marquee_config_v2" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          applyConfig(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Cross-tab BroadcastChannel (instant messaging between tabs)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("drivex_marquee_channel");
        bc.onmessage = (msg) => {
          if (msg.data) {
            applyConfig(msg.data);
          }
        };
      }
    } catch (e) {}

    // 5. Visibility / Focus refresh (when user clicks back to this tab)
    const handleFocus = () => {
      void fetchServerMarqueeConfig().then((data) => {
        if (data && data.categories) {
          setConfig((prev) => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
        }
      });
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 6. Polling fallback every 2 seconds
    const interval = setInterval(() => {
      void fetchServerMarqueeConfig().then((data) => {
        if (data && data.categories) {
          setConfig((prev) => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
        }
      });
    }, 2000);

    return () => {
      window.removeEventListener("marquee_config_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  // Dynamic Count Helpers
  const getCategoryCount = (catId: string) => {
    const cid = catId.toLowerCase();
    if (cid === "all") return products.length;
    if (cid === "suv") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        return b.includes("suv") || b.includes("crossover");
      }).length;
    }
    if (cid === "sedan") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        const n = p.name.toLowerCase();
        return b.includes("sedan") || b.includes("sport") || n.includes("camry") || n.includes("corolla") || n.includes("crown") || n.includes("supra");
      }).length;
    }
    if (cid === "truck") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        const n = p.name.toLowerCase();
        return b.includes("truck") || n.includes("tacoma") || n.includes("tundra");
      }).length;
    }
    if (cid === "ev") {
      return products.filter((p) => {
        const ct = (p.category_type || "").toLowerCase();
        const tl = (p.top_label || "").toLowerCase();
        const n = p.name.toLowerCase();
        return ct.includes("electric") || tl.includes("ev") || tl.includes("hybrid") || n.includes("bz4x") || n.includes("prius") || n.includes("seal");
      }).length;
    }
    if (cid === "minivan") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        return b.includes("van") || b.includes("minivan") || p.name.toLowerCase().includes("sienna");
      }).length;
    }
    if (cid === "ebike") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        const ct = (p.category_type || "").toLowerCase();
        return b.includes("bike") || ct.includes("bicycle") || p.name.toLowerCase().includes("super73") || p.name.toLowerCase().includes("specialized");
      }).length;
    }
    if (cid === "parts") {
      return products.filter((p) => {
        const b = (p.body_type || "").toLowerCase();
        const ct = (p.category_type || "").toLowerCase();
        return b.includes("part") || ct.includes("spare_part") || p.name.toLowerCase().includes("brembo");
      }).length;
    }
    // Generic match
    return products.filter((p) => {
      const b = (p.body_type || "").toLowerCase();
      const ct = (p.category_type || "").toLowerCase();
      return b.includes(cid) || ct.includes(cid) || p.name.toLowerCase().includes(cid);
    }).length;
  };

  const getBrandCount = (brandId: string) => {
    if (brandId === "all") return products.length;
    return products.filter((p) => (p.brand || "").toLowerCase() === brandId.toLowerCase()).length;
  };

  // Horizontal Pill Card for Categories
  const renderCategoryCard = (cat: CategoryItem, keyPrefix: string) => {
    const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
    const count = getCategoryCount(cat.id);

    return (
      <button
        key={`${keyPrefix}-${cat.id}`}
        type="button"
        onClick={() => onSelectCategory(cat.id)}
        className={`group relative shrink-0 h-[44px] sm:h-[48px] px-3.5 sm:px-4.5 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none text-left whitespace-nowrap ${
          isSelected
            ? "bg-amber-400 text-slate-950 font-black border-amber-400 shadow-md ring-2 ring-amber-400/35 scale-[1.02]"
            : darkVariant
              ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 shadow-2xs"
              : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 hover:text-slate-950 hover:border-slate-300 shadow-2xs"
        }`}
      >
        {/* Clean Icon in Front */}
        <div className="shrink-0 flex items-center justify-center">
          {getCategoryIcon(cat.iconKey, isSelected)}
        </div>

        {/* Text Immediately Next to the Icon */}
        <span className={`text-xs sm:text-[13px] tracking-tight ${isSelected ? "font-black text-slate-950" : "font-bold"}`}>
          {cat.name}
        </span>

        {/* Model Count Badge */}
        <span
          className={`text-[10px] sm:text-[11px] font-bold font-mono px-2 py-0.5 rounded-full leading-none shrink-0 ${
            isSelected
              ? "bg-slate-950/15 text-slate-950"
              : darkVariant
                ? "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
          }`}
        >
          +{count}
        </span>
      </button>
    );
  };

  // Horizontal Pill Card for Brands
  const renderBrandCard = (brand: BrandItem, keyPrefix: string) => {
    const isSelected = selectedBrand.toLowerCase() === brand.id.toLowerCase();
    const count = getBrandCount(brand.id);

    return (
      <button
        key={`${keyPrefix}-${brand.id}`}
        type="button"
        onClick={() => onSelectBrand(brand.id)}
        className={`group relative shrink-0 h-[44px] sm:h-[48px] px-3.5 sm:px-4.5 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none text-left whitespace-nowrap ${
          isSelected
            ? "bg-amber-400 text-slate-950 font-black border-amber-400 shadow-md ring-2 ring-amber-400/35 scale-[1.02]"
            : darkVariant
              ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 shadow-2xs"
              : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 hover:text-slate-950 hover:border-slate-300 shadow-2xs"
        }`}
      >
        {/* Brand Logo in Front */}
        <div className="shrink-0 flex items-center justify-center">
          {brand.id === "all" ? (
            <Sparkles className={`w-4.5 h-4.5 ${isSelected ? "text-slate-950 fill-slate-950" : "text-amber-400"}`} />
          ) : (
            <div className="w-6.5 h-4.5 flex items-center justify-center">
              {getBrandLogo(brand.id, isSelected, darkVariant)}
            </div>
          )}
        </div>

        {/* Brand Name Immediately Next to the Logo */}
        <span className={`text-xs sm:text-[13px] tracking-tight ${isSelected ? "font-black text-slate-950" : "font-bold"}`}>
          {brand.name}
        </span>

        {/* Model Count Badge */}
        <span
          className={`text-[10px] sm:text-[11px] font-bold font-mono px-2 py-0.5 rounded-full leading-none shrink-0 ${
            isSelected
              ? "bg-slate-950/15 text-slate-950"
              : darkVariant
                ? "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
          }`}
        >
          +{count}
        </span>
      </button>
    );
  };

  const hasFilterActive = selectedCategory !== "all" || selectedBrand !== "all";
  const speedSeconds = config.speed || 40;

  return (
    <div className={`w-full ${className}`}>
      {/* Top Header Row with Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${darkVariant ? "text-white" : "text-slate-900 dark:text-white"}`}>
              ប្រភេទ និងប្រេនរថយន្តពេញនិយម (Brands & Categories)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30">
              {speedSeconds}s Speed
            </span>
          </div>
          <p className={`text-xs mt-0.5 font-medium ${darkVariant ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
            រុញ Mouse ពីលើដើម្បីផ្អាក (Hover to pause) • ចុចលើប្រអប់ដើម្បី Filter រថយន្ត
          </p>
        </div>

        {/* Tab Switcher & Marquee Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher Tabs */}
          <div className={`flex items-center p-1 rounded-xl border ${darkVariant ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <button
              type="button"
              onClick={() => setActiveTab("dual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dual"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : darkVariant
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              ទាំងអស់ (Dual)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("category")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "category"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : darkVariant
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              ប្រភេទឡាន ({config.categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "brand"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : darkVariant
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              ប្រេនឡាន ({config.brands.length})
            </button>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border transition-colors shadow-2xs cursor-pointer flex items-center justify-center ${
              isPaused
                ? "bg-amber-400 text-slate-950 border-amber-400"
                : darkVariant
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            title={isPaused ? "បន្តចលនា (Resume Marquee)" : "ផ្អាកចលនា (Pause Marquee)"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Reset button if filter is active */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => {
                onSelectCategory("all");
                onSelectBrand("all");
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkVariant
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* The Continuous Infinite Marquee Ticker (Dynamic Speed & Elements) */}
      <div 
        className={`marquee-wrapper ${isPaused ? "[&_.marquee-track]:[animation-play-state:paused!important]" : ""}`}
        style={{ ["--marquee-speed" as any]: `${speedSeconds}s` }}
      >
        {/* Row 1: Vehicle Categories (Forward Marquee) */}
        {(activeTab === "dual" || activeTab === "category") && (
          <div className="marquee-track-container">
            <div className="marquee-track" style={{ ["--marquee-speed" as any]: `${speedSeconds}s` }}>
              {config.categories.map((cat) => renderCategoryCard(cat, "cat-a1"))}
              {config.categories.map((cat) => renderCategoryCard(cat, "cat-a2"))}
            </div>
            <div className="marquee-track" aria-hidden="true" style={{ ["--marquee-speed" as any]: `${speedSeconds}s` }}>
              {config.categories.map((cat) => renderCategoryCard(cat, "cat-dup-a1"))}
              {config.categories.map((cat) => renderCategoryCard(cat, "cat-dup-a2"))}
            </div>
          </div>
        )}

        {/* Row 2: Official Brands (Reverse Marquee) */}
        {(activeTab === "dual" || activeTab === "brand") && (
          <div className="marquee-track-container">
            <div className="marquee-track reverse" style={{ ["--marquee-speed" as any]: `${speedSeconds}s` }}>
              {config.brands.map((brand) => renderBrandCard(brand, "brand-b1"))}
              {config.brands.map((brand) => renderBrandCard(brand, "brand-b2"))}
            </div>
            <div className="marquee-track reverse" aria-hidden="true" style={{ ["--marquee-speed" as any]: `${speedSeconds}s` }}>
              {config.brands.map((brand) => renderBrandCard(brand, "brand-dup-b1"))}
              {config.brands.map((brand) => renderBrandCard(brand, "brand-dup-b2"))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
