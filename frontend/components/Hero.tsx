"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  Car,
  DollarSign,
  ChevronDown,
  ArrowLeftRight,
  CreditCard
} from "lucide-react";
import { Branch } from "./types";

interface HeroProps {
  branches?: Branch[];
  selectedBranch?: Branch | null;
  onSelectBranch?: (branch: Branch) => void;
  onScrollToShowroom: () => void;
  onSearchCars?: (query: string, type: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  branches = [],
  selectedBranch,
  onSelectBranch,
  onScrollToShowroom,
  onSearchCars,
}) => {
  const [activeHeroTab, setActiveHeroTab] = useState<"rent" | "oneway" | "longterm">("rent");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedBudget, setSelectedBudget] = useState<string>("Any Budget");
  const [pickupDate, setPickupDate] = useState<string>("");

  const router = useRouter();

  const handleSearchClick = () => {
    let url = "/shop";
    if (selectedType !== "All Types") {
      const slug = selectedType.toLowerCase();
      if (slug.includes("suv")) url += "?category=suv";
      else if (slug.includes("sedan")) url += "?category=sedan";
      else if (slug.includes("truck")) url += "?category=truck";
      else if (slug.includes("electric")) url += "?category=ev";
    }
    router.push(url);
  };

  return (
    <section className="relative bg-[#0f172a] text-white overflow-hidden pb-16 lg:pb-24">
      
      {/* Background Scenic Road & Luxury Vehicle Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=85&w=2000"
          alt="Scenic coastal highway driving"
          className="w-full h-full object-cover object-center opacity-40 brightness-95"
        />
        {/* Gradients to blend smoothly with navbar and bottom content */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/95 via-[#0f172a]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-[#090d16]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20">
        
        {/* Main Hero Headline & Trust Badges */}
        <div className="max-w-2xl space-y-5">
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Drive Your Journey, <br />
            <span className="text-amber-400">Your Way</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
            Explore Cambodia with comfort, peace of mind, and modern style. <br className="hidden sm:inline" />
            Best vehicle showroom purchases & installment financing at the best prices.
          </p>

          {/* 3 Gold-Accent Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-200 font-medium">
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">No Hidden Charges</div>
                <div className="text-[11px] text-slate-300">Transparent Pricing</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Free Trade-In Appraisal</div>
                <div className="text-[11px] text-slate-300">Instant Valuation</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">24/7 Support</div>
                <div className="text-[11px] text-slate-300">We're Here to Help</div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating DriveX Search & Booking Widget */}
        <div id="hero-booking" className="mt-12 lg:mt-16 bg-white rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-800 border border-slate-100 scroll-mt-24">
          
          {/* Top Service Tabs */}
          <div className="flex items-center gap-4 sm:gap-8 pb-5 mb-5 border-b border-slate-100 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveHeroTab("rent")}
              className={`flex items-center gap-2 pb-1 transition-all cursor-pointer ${
                activeHeroTab === "rent"
                  ? "text-slate-900 border-b-2 border-amber-400 font-black"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Car className="w-4 h-4 text-slate-900" />
              <span>Buy / Rent a Car (ទិញ ឬជួល)</span>
            </button>

            <button
              onClick={() => setActiveHeroTab("oneway")}
              className={`flex items-center gap-2 pb-1 transition-all cursor-pointer ${
                activeHeroTab === "oneway"
                  ? "text-slate-900 border-b-2 border-amber-400 font-black"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-900" />
              <span>Trade-In & Resell (ប្ដូររថយន្តចាស់)</span>
            </button>

            <button
              onClick={() => setActiveHeroTab("longterm")}
              className={`flex items-center gap-2 pb-1 transition-all cursor-pointer ${
                activeHeroTab === "longterm"
                  ? "text-slate-900 border-b-2 border-amber-400 font-black"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <CreditCard className="w-4 h-4 text-slate-900" />
              <span>Installment Loan (បង់រំលោះ 12-72ខែ)</span>
            </button>
          </div>

          {/* Form Fields Row (Matching DriveX Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-center">
            
            {/* 1. Pick-up Location */}
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Showroom Location
              </label>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-900">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-slate-900 shrink-0" />
                  <select 
                    value={selectedBranch?.id || ""} 
                    onChange={(e) => {
                      const found = branches.find(b => b.id === e.target.value);
                      if (found && onSelectBranch) onSelectBranch(found);
                    }}
                    className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Vehicle Body Type */}
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vehicle Type
              </label>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900">
                <Car className="w-4 h-4 text-slate-900 shrink-0" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="All Types">All Types (គ្រប់ប្រភេទ)</option>
                  <option value="SUVs">SUVs & Trucks</option>
                  <option value="Sedans">Sedans & Executive</option>
                  <option value="Electric">Electric & Hybrid (EV)</option>
                  <option value="Toyota">Toyota 2026-2027 Lineup</option>
                </select>
              </div>
            </div>

            {/* 3. Pick-up Date */}
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pick-up / Delivery Date
              </label>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900">
                <Calendar className="w-4 h-4 text-slate-900 shrink-0" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer text-xs"
                />
              </div>
            </div>

            {/* 4. Budget Range */}
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Budget / Financing
              </label>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900">
                <DollarSign className="w-4 h-4 text-slate-900 shrink-0" />
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="Any Budget">Any Budget (គ្រប់កម្រិត)</option>
                  <option value="Under $30k">ក្រោម $30,000</option>
                  <option value="$30k - $50k">$30,000 - $50,000</option>
                  <option value="$50k+">$50,000 ឡើងទៅ (VIP)</option>
                </select>
              </div>
            </div>

            {/* 5. Golden-Yellow Search CTA Button */}
            <div>
              <button
                onClick={handleSearchClick}
                className="w-full h-14 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Search Cars</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
