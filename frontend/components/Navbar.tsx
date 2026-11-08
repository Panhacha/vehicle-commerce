"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { 
  Car, 
  ShoppingCart,
  MapPin,
  Mail,
  Phone,
  Headphones,
  ChevronDown,
  Menu,
  X,
  Calculator,
  Repeat,
  Sparkles,
  Compass,
  ArrowRight,
  User,
  LogOut
} from "lucide-react";
import { Branch } from "./types";
import { useCart } from "./CartContext";
import { MOCK_BRANCHES } from "./mockData";
import { MyBookingModal } from "./MyBookingModal";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface NavbarProps {
  branches?: Branch[];
  selectedBranch?: Branch | null;
  onSelectBranch?: (branch: Branch) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: "showroom") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: any[];
  selectedCategory?: string;
  onSelectCategory?: (categorySlug: string) => void;
  products?: any[];
  selectedBrand?: string;
  onSelectBrand?: (brand: string) => void;
  onClearBrand?: () => void;
  onOpenLoanModal?: () => void;
  onOpenTradeInModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  branches = MOCK_BRANCHES,
  selectedBranch: propSelectedBranch,
  onSelectBranch,
  activeTab,
  setActiveTab,
  onSelectCategory,
  onOpenLoanModal,
  onOpenTradeInModal,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItemCount } = useCart();
  const { customer, isLoggedIn, openAuthModal, logout } = useCustomerAuth();

  const [internalBranch, setInternalBranch] = useState<Branch>(() => {
    return propSelectedBranch || branches[0] || MOCK_BRANCHES[0];
  });

  const currentBranch = propSelectedBranch || internalBranch;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Listen for open-my-booking events from anywhere in the app
  useEffect(() => {
    const handleOpenBooking = () => setIsBookingModalOpen(true);
    window.addEventListener("open-my-booking", handleOpenBooking);
    return () => window.removeEventListener("open-my-booking", handleOpenBooking);
  }, []);

  const navRef = useRef<HTMLDivElement>(null);

  // Sync internal branch if prop changes
  useEffect(() => {
    if (propSelectedBranch) {
      setInternalBranch(propSelectedBranch);
    }
  }, [propSelectedBranch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBranchSelect = (b: Branch) => {
    setInternalBranch(b);
    if (onSelectBranch) {
      onSelectBranch(b);
    }
    setIsBranchDropdownOpen(false);
  };

  const handleNavHome = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (setActiveTab) {
      setActiveTab("showroom");
    }
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  const handleBookingClick = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setIsBookingModalOpen(true);
  };

  const handleLoanClick = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    if (onOpenLoanModal) {
      onOpenLoanModal();
    } else if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-loan-modal"));
    } else {
      router.push("/#loan");
    }
  };

  const handleTradeInClick = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    if (onOpenTradeInModal) {
      onOpenTradeInModal();
    } else if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-tradein-modal"));
    } else {
      router.push("/#tradein");
    }
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
    setIsBranchDropdownOpen(false);
  };

  const isHome = pathname === "/";
  const isShop = pathname === "/shop";
  const isCheckout = pathname === "/checkout" || pathname === "/cart";

  const handleNavShop = (categorySlug?: string) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    if (!categorySlug || categorySlug === "all") {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${categorySlug}`);
    }
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-xl select-none">
      
      {/* =========================================================================
          1. TOP UTILITY INFO BAR (DriveX Signature Styling)
          ========================================================================= */}
      <div className="bg-[#090d16] border-b border-slate-800/80 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3">
          
          {/* Left: Showroom Location & Contact */}
          <div className="flex items-center gap-3 sm:gap-5 whitespace-nowrap overflow-hidden">
            
            {/* Showroom Branch Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer py-1"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">Showroom:</span>
                <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-none">
                  {currentBranch?.name || "Phnom Penh Main Showroom (HQ)"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {/* Branch Dropdown Menu */}
              {isBranchDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 text-slate-200 backdrop-blur-md">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    ជ្រើសរើសសាខាបង្ហាញរថយន្ត (Showroom)
                  </div>
                  <div className="mt-1 divide-y divide-slate-800/50">
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBranchSelect(b)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          currentBranch?.id === b.id ? "font-bold text-amber-400 bg-slate-800/50" : "text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white">{b.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{b.address}, {b.city}</div>
                        </div>
                        {currentBranch?.id === b.id && (
                          <span className="text-amber-400 text-sm font-bold ml-2">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-slate-700 hidden md:inline">|</span>

            {/* Email Contact */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>support@drivex-cambodia.com</span>
            </div>

            <span className="text-slate-700 hidden lg:inline">|</span>

            {/* Phone Contact */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>+855 23 888 999</span>
            </div>
          </div>

          {/* Right: Support & Sitemap */}
          <div className="flex items-center gap-3 sm:gap-4 whitespace-nowrap text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Headphones className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>24/7 Support</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <Link 
              href="/sitemap"
              className={`flex items-center gap-1 transition-colors ${
                pathname === "/sitemap" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-amber-400"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Sitemap</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN DRIVEX NAVIGATION BAR (Clean, single-line, zero wrap)
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand Logo with New Auto Car Silhouette & Styling */}
        <div 
          onClick={handleNavHome} 
          className="flex items-center cursor-pointer shrink-0 group select-none py-1"
        >
          <img 
            src="/logo-dark.png" 
            alt="AUTO CAR" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-sm" 
          />
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-[13px] font-semibold tracking-normal whitespace-nowrap">
          
          {/* HOME */}
          <button
            type="button"
            onClick={handleNavHome}
            className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isHome
                ? "text-amber-400 font-bold border-b-2 border-amber-400"
                : "text-slate-300 hover:text-white"
            }`}
          >
            HOME
          </button>

          {/* SHOP & RENT CARS (with interactive dropdown) */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("rent")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => handleNavShop("all")}
              className={`px-2 xl:px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                isShop
                  ? "text-amber-400 font-bold border-b-2 border-amber-400"
                  : "text-slate-300 hover:text-amber-400"
              }`}
            >
              <span>SHOP CARS</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "rent" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
            </button>

            {activeDropdown === "rent" && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 backdrop-blur-lg">
                  <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    ប្រភេទរថយន្ត និងម៉ូឌែល (Categories)
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {[
                      { name: "All Cars (គ្រប់ម៉ូឌែល)", slug: "all", desc: "Browse 33 models" },
                      { name: "SUVs & Crossovers", slug: "suv", desc: "14 Models in stock" },
                      { name: "Sedans & Sports", slug: "sedan", desc: "8 Models in stock" },
                      { name: "Trucks & Pickups", slug: "truck", desc: "4 Models in stock" },
                      { name: "Electric & Hybrids (EV)", slug: "ev", desc: "7 Models in stock" },
                      { name: "Minivans & Family", slug: "minivan", desc: "High comfort vans" },
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleNavShop(cat.slug)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 hover:text-amber-400 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold">{cat.name}</div>
                          <div className="text-[10px] text-slate-400">{cat.desc}</div>
                        </div>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DEALS */}
          <button
            type="button"
            onClick={() => scrollToSection("top-deals")}
            className="px-2 xl:px-2.5 py-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>DEALS</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
              HOT
            </span>
          </button>

          {/* LOCATIONS */}
          <button
            type="button"
            onClick={() => scrollToSection("locations")}
            className="px-2 xl:px-2.5 py-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            LOCATIONS
          </button>

          {/* SERVICES (Dropdown for Loan Calculator & Trade-In) */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("services")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => toggleDropdown("services")}
              className="px-2 xl:px-2.5 py-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <span>SERVICES</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "services" ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
            </button>

            {activeDropdown === "services" && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 backdrop-blur-lg">
                  <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    សេវាកម្មហិរញ្ញវត្ថុ & រថយន្ត
                  </div>
                  <div className="mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={handleLoanClick}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Loan Calculator</div>
                        <div className="text-[10px] text-slate-400">គណនាការបង់រំលោះប្រចាំខែ</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleTradeInClick}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Trade-In Appraisal</div>
                        <div className="text-[10px] text-slate-400">វាយតម្លៃប្តូរយករថយន្តថ្មី</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToSection("how-it-works")}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 hover:text-blue-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">How It Works</div>
                        <div className="text-[10px] text-slate-400">ស្វែងយល់ពីរបៀបជួល និងកក់</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CONTACT US */}
          <button
            type="button"
            onClick={() => scrollToSection("footer-contact")}
            className="px-2 xl:px-2.5 py-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            CONTACT US
          </button>
        </nav>

        {/* Right Side Actions: Cart + MY BOOKING Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          
          {/* Customer Login / Account Pill */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold transition-all cursor-pointer"
                title={customer?.full_name}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {customer?.full_name?.charAt(0) || "U"}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate">{customer?.full_name?.split(" ")[0]}</span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-bold text-white truncate">{customer?.full_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{customer?.phone}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified Customer
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleBookingClick();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center gap-2 cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>ការកក់របស់ខ្ញុំ (My Bookings)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-rose-400 flex items-center gap-2 cursor-pointer border-t border-slate-800 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ចាកចេញ (Log Out)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-400/60 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-amber-400 text-xs font-bold transition-all cursor-pointer"
              title="ចូលគណនី ឬចុះឈ្មោះ"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ចូលគណនី</span>
            </button>
          )}

          {/* Shopping Cart Icon */}
          <Link
            href="/checkout"
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm ${
              isCheckout ? "text-amber-400 ring-2 ring-amber-400/40" : "text-slate-200 hover:text-amber-400"
            }`}
            title="Cart & Reservations"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-sm">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* Golden Yellow Accent CTA Button: MY BOOKING */}
          <button
            type="button"
            onClick={handleBookingClick}
            className={`px-3 sm:px-4 py-2 rounded-lg text-slate-950 text-xs sm:text-xs xl:text-sm font-extrabold uppercase tracking-wide transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap ${
              isCheckout 
                ? "bg-amber-300 ring-2 ring-white/50" 
                : "bg-amber-400 hover:bg-amber-300 active:bg-amber-500 hover:shadow-amber-400/20"
            }`}
          >
            MY BOOKING
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800 text-slate-200 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. MOBILE / TABLET DRAWER (Clean accordion with icons & fast actions)
          ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#090d16] border-t border-slate-800 px-4 py-4 space-y-1.5 text-sm font-medium shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={handleNavHome}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 ${
              isHome ? "text-amber-400 font-bold bg-slate-800/60" : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            <span>🏠</span>
            <span>HOME (ទំព័រដើម)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavShop("all")}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 ${
              isShop ? "text-amber-400 font-bold bg-slate-800/60" : "text-slate-300 hover:text-amber-400 hover:bg-slate-800/80"
            }`}
          >
            <span>🚗</span>
            <span>SHOP CARS (រថយន្តទាំងអស់)</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("top-deals")}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🔥</span>
              <span>SPECIAL DEALS</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
              HOT
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("locations")}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 flex items-center gap-2"
          >
            <span>📍</span>
            <span>SHOWROOM LOCATIONS (សាខា)</span>
          </button>

          <button
            type="button"
            onClick={handleLoanClick}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 flex items-center gap-2"
          >
            <span>🧮</span>
            <span>LOAN CALCULATOR (គណនាកម្ចី)</span>
          </button>

          <button
            type="button"
            onClick={handleTradeInClick}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 flex items-center gap-2"
          >
            <span>🔄</span>
            <span>TRADE-IN (វាយតម្លៃឡានចាស់)</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("footer-contact")}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 flex items-center gap-2"
          >
            <span>📞</span>
            <span>CONTACT US (ទំនាក់ទំនង)</span>
          </button>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {isLoggedIn ? (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{customer?.full_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{customer?.phone}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition-colors"
                >
                  ចាកចេញ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 rounded-xl border border-amber-400/50 bg-slate-800/80 text-amber-400 font-bold text-center flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>ចូលគណនី ឬចុះឈ្មោះ (Login / Register)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBookingClick}
              className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-center flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>MY BOOKING & CART ({totalItemCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer Booking Tracker & Lookup Modal */}
      <MyBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
