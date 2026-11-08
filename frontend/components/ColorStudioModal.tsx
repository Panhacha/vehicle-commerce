"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Calculator, 
  Repeat, 
  Sparkles, 
  Gauge, 
  Users, 
  Check, 
  ShieldCheck, 
  MoveHorizontal,
  Bookmark,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Disc,
  Eye,
  Camera,
  Maximize2,
  Fuel,
  FileText
} from "lucide-react";
import { Product, VehicleColorOption, Branch } from "./types";
import { BrandEmblem } from "./ShopByBrand";

interface ColorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedBranch?: Branch | null;
  onOpenOrderModal?: (product: Product, selectedColor?: string) => void;
  onOpenLoanModal?: (product: Product) => void;
  onOpenTradeInModal?: (product: Product) => void;
}

// Curated high-fidelity color palette matching the luxury configurator
const CONFIG_PALETTES = [
  { id: "gold", name: "Desert Sand Metallic", hex: "#C5A059", code: "P-4M9", price: 0 },
  { id: "white", name: "Wind Chill Pearl", hex: "#F4F6F9", code: "P-089", price: 500 },
  { id: "grey", name: "Brooklyn Slate Grey", hex: "#71767B", code: "P-1L5", price: 0 },
  { id: "green", name: "Imperial Dark Green", hex: "#22352A", code: "P-6X3", price: 0 },
  { id: "black", name: "Midnight Onyx Black", hex: "#141518", code: "P-218", price: 0 },
  { id: "red", name: "Supersonic Crimson Red", hex: "#8E1724", code: "P-3U5", price: 500 },
];

// Wheels options
const WHEEL_OPTIONS = [
  { id: "w-19-aero", name: "19\" Aero Standard", size: "19\"", price: 0, preview: "aero" },
  { id: "w-20-black", name: "20\" Taiga Sport Black", size: "20\"", price: 800, preview: "black" },
  { id: "w-20-diamond", name: "20\" Diamond Cut Multi-Spoke", size: "20\"", price: 1200, preview: "diamond" },
  { id: "w-21-offroad", name: "21\" Forged All-Terrain", size: "21\"", price: 1800, preview: "forged" },
];

// Brake caliper options
const BRAKE_OPTIONS = [
  { id: "b-black", name: "Standard Black Calipers", colorName: "Black", hex: "#1e293b", price: 0 },
  { id: "b-red", name: "Red Brembo Performance Calipers", colorName: "Red Sport", hex: "#dc2626", price: 500 },
];

// Option packages
const PACKAGE_OPTIONS = [
  { id: "pkg-none", name: "Standard (No Package)", price: 0, desc: "Standard factory equipment" },
  { id: "pkg-tech", name: "Tech & Driver Pilot Package", price: 1450, desc: "HUD, 360° Cam, Pro Pilot Assist" },
  { id: "pkg-adventure", name: "All-Weather Adventure Pack", price: 2100, desc: "Roof rails, all-weather mats & armor" },
  { id: "pkg-luxury", name: "Executive Luxury Lounge Pack", price: 3500, desc: "Ventilated massage seats & 14-spk JBL" },
];

export const ColorStudioModal: React.FC<ColorStudioModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedBranch,
  onOpenOrderModal,
  onOpenLoanModal,
  onOpenTradeInModal,
}) => {
  // Mode: Exterior vs Interior
  const [viewMode, setViewMode] = useState<"exterior" | "interior">("exterior");
  
  // Angle: 360 (side), front, rear, studio, wheel, interior
  const [activeAngle, setActiveAngle] = useState<"360" | "front" | "rear" | "studio" | "wheel" | "interior">("360");

  // Configurator selections
  const [selectedTrim, setSelectedTrim] = useState<"core" | "concept" | "performance">("concept");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedWheelId, setSelectedWheelId] = useState(WHEEL_OPTIONS[1].id);
  const [selectedBrakeId, setSelectedBrakeId] = useState(BRAKE_OPTIONS[0].id);
  const [selectedPackageId, setSelectedPackageId] = useState(PACKAGE_OPTIONS[0].id);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllSpecsModal, setShowAllSpecsModal] = useState(false);

  // Keyboard navigation & ESC close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handleCycleAngle(-1);
      if (e.key === "ArrowRight") handleCycleAngle(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activeAngle]);

  // Reset when opening a new product
  useEffect(() => {
    if (product) {
      setViewMode("exterior");
      setActiveAngle("360");
      setSelectedColorIndex(0);
      setSelectedTrim("concept");
      setSelectedWheelId(WHEEL_OPTIONS[1].id);
      setSelectedBrakeId(BRAKE_OPTIONS[0].id);
      setSelectedPackageId(PACKAGE_OPTIONS[0].id);
      setIsSaved(false);
    }
  }, [product?.id]);

  if (!isOpen || !product) return null;

  // Body Type determination
  const isSedan = product.body_type?.toLowerCase() === "sedan";

  // Dedicated angle images tailored for full exterior & interior inspection
  const getAngleImage = (angleId: string) => {
    switch (angleId) {
      case "front":
        return isSedan ? "/angles/sedan_front.jpg" : "/angles/suv_front.jpg";
      case "rear":
        return isSedan ? "/angles/sedan_rear.jpg" : "/angles/suv_rear.jpg";
      case "studio":
        return "/angles/suv_34.jpg";
      case "wheel":
        return "/angles/wheel_macro.jpg";
      case "interior":
        return "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80";
      case "360":
      default:
        return product.images?.[0] || "/placeholder-car.png";
    }
  };

  // Angle gallery definitions matching Khmer user request (Front ពីមុខ, Rear ពីក្រោយ, Side ចំហៀង, etc.)
  const ANGLE_GALLERY = [
    { id: "360", titleKh: "ចំហៀង", titleEn: "Exterior 360°", is360: true, desc: "ទិដ្ឋភាពចំហៀងមួយតួខ្លួន (Side Profile)" },
    { id: "front", titleKh: "ពីមុខ", titleEn: "Front Grille", is360: false, desc: "ប៉ាណា និងភ្លើង LED ពីមុខ (Front View)" },
    { id: "rear", titleKh: "ពីក្រោយ", titleEn: "Rear Tailgate", is360: false, desc: "កាង និងភ្លើងស្តុបពីក្រោយ (Rear View)" },
    { id: "studio", titleKh: "មុំ ៣/៤", titleEn: "Studio 3/4", is360: false, desc: "ទិដ្ឋភាពមុំកាច់ស្ទូឌីយោ (Dynamic Perspective)" },
    { id: "wheel", titleKh: "យ៉ាន់កង់", titleEn: "Wheels & Brakes", is360: false, desc: "យ៉ាន់ស្ព័រ និងហ្វ្រាំង Brembo (Sport Alloy)" },
    { id: "interior", titleKh: "ផ្នែកខាងក្នុង", titleEn: "Cockpit Interior", is360: false, desc: "កាប៊ីនប្រណីត និង HUD (Luxury Cabin)" },
  ];

  // Angle navigation handler
  const handleCycleAngle = (direction: -1 | 1) => {
    const currentIndex = ANGLE_GALLERY.findIndex((a) => a.id === activeAngle);
    const nextIndex = (currentIndex + direction + ANGLE_GALLERY.length) % ANGLE_GALLERY.length;
    const nextAngle = ANGLE_GALLERY[nextIndex];
    if (nextAngle.id === "interior") {
      setViewMode("interior");
    } else {
      setViewMode("exterior");
    }
    setActiveAngle(nextAngle.id as any);
  };

  const currentAngleObj = ANGLE_GALLERY.find((a) => a.id === activeAngle) || ANGLE_GALLERY[0];

  // Active color
  const colors = CONFIG_PALETTES;
  const activeColor = colors[selectedColorIndex] || colors[0];
  const activeWheel = WHEEL_OPTIONS.find((w) => w.id === selectedWheelId) || WHEEL_OPTIONS[0];
  const activeBrake = BRAKE_OPTIONS.find((b) => b.id === selectedBrakeId) || BRAKE_OPTIONS[0];
  const activePackage = PACKAGE_OPTIONS.find((p) => p.id === selectedPackageId) || PACKAGE_OPTIONS[0];

  // Price calculations
  const trimPriceDelta = selectedTrim === "concept" ? 2800 : selectedTrim === "performance" ? 5400 : 0;
  const colorPriceDelta = activeColor.price;
  const wheelPriceDelta = activeWheel.price;
  const brakePriceDelta = activeBrake.price;
  const packagePriceDelta = activePackage.price;

  const totalCalculatedPrice = product.base_price + trimPriceDelta + colorPriceDelta + wheelPriceDelta + brakePriceDelta + packagePriceDelta;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[1440px] bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* ========================================================================= */}
        {/* 1. TOP BAR: Back Button | Exterior/Interior Toggle | Sticky Config Card   */}
        {/* ========================================================================= */}
        <div className="relative px-5 sm:px-8 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 z-20">
          
          {/* Left: Back to Models */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Models</span>
          </button>

          {/* Center: Exterior / Interior Segmented Switcher */}
          <div className="flex items-center p-1 rounded-full bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => {
                setViewMode("exterior");
                if (activeAngle === "interior") setActiveAngle("360");
              }}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "exterior" && activeAngle !== "interior"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <span>Exterior (ផ្នែកក្រៅ)</span>
            </button>
            <button
              onClick={() => {
                setViewMode("interior");
                setActiveAngle("interior");
              }}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "interior" || activeAngle === "interior"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <span>Interior (ផ្នែកខាងក្នុង)</span>
            </button>
          </div>

          {/* Right: Floating Configuration Summary & Quick CTA */}
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex flex-col text-right">
              <div className="flex items-center justify-end gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                <span>Your Configuration</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white leading-tight">
                ${totalCalculatedPrice.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => onOpenOrderModal?.(product, activeColor.name)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-950 dark:text-white font-black text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md cursor-pointer"
            >
              <span>Pre-Order</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN STAGE: Left Typography & Description | Center Turntable Display   */}
        {/* ========================================================================= */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] lg:min-h-[370px] bg-gradient-to-b from-slate-50 via-white to-slate-100/90 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 p-4 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden">
          
          {/* Ambient Glow corresponding to active color */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 rounded-full blur-3xl opacity-20 dark:opacity-20 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: activeColor.hex }}
          />

          {/* Left Title Block */}
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
                Configurator Studio
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25">
                {currentAngleObj.titleKh} • {currentAngleObj.titleEn}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-none mt-1">
              <span>{product.brand} </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{product.model || product.name.replace(product.brand, "").trim()}</span>
            </h1>
            <div className="mt-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {currentAngleObj.desc}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 line-clamp-1">
                ពិនិត្យមើលមួយតួរនៃឡានទាំងមូល — ចុចព្រួញឆ្វេង/ស្តាំ ឬជ្រើសរើសផ្នែកខាងក្រោម។
              </p>
            </div>

            {/* Comprehensive Key Performance Badges & Full Specs Trigger */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {product.specs?.["Power"] && (
                <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  ⚡ {product.specs["Power"].split("/")[0]}
                </span>
              )}
              {product.mpg_range && (
                <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  ⛽ {product.mpg_range}
                </span>
              )}
              {product.seating && (
                <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  👥 {product.seating} Seats
                </span>
              )}
              {product.specs?.["Engine"] && (
                <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  ⚙️ {product.specs["Engine"].split(" ")[0]}
                </span>
              )}
              {product.sku && (
                <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                  SKU: {product.sku}
                </span>
              )}

              {/* View All Specs Button */}
              <button
                type="button"
                onClick={() => setShowAllSpecsModal(true)}
                className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-3 h-3 text-amber-500" />
                <span>មើលទិន្នន័យ & Specs ទាំងអស់</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Vehicle Turntable Display with Cycle Arrows */}
          <div className="relative my-auto w-full flex items-center justify-center py-2">
            
            {/* Left Nav Arrow Button */}
            <button
              onClick={() => handleCycleAngle(-1)}
              className="absolute left-2 sm:left-4 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Previous Angle (Arrow Left)"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right Nav Arrow Button */}
            <button
              onClick={() => handleCycleAngle(1)}
              className="absolute right-2 sm:right-4 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Next Angle (Arrow Right)"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {viewMode === "exterior" && activeAngle !== "interior" ? (
              <div className="relative w-full max-w-4xl flex items-center justify-center">
                {/* Simulated Circular Studio Turntable Platform */}
                <div className="absolute -bottom-3 w-4/5 max-w-2xl h-14 rounded-[100%] border border-slate-300/50 dark:border-slate-700/40 bg-gradient-to-b from-transparent to-slate-200/40 dark:to-slate-800/40 shadow-inner -z-1" />
                <div className="absolute -bottom-1 w-3/4 max-w-xl h-8 bg-slate-950/25 dark:bg-black/60 rounded-[100%] blur-md -z-1" />

                {/* Main Vehicle Image Corresponding to Active Angle */}
                <div className="relative max-h-[250px] sm:max-h-[300px] w-auto flex items-center justify-center transition-all duration-300">
                  <img
                    key={`${product.id}-${activeAngle}-${activeColor.id}`}
                    src={getAngleImage(activeAngle)}
                    alt={`${product.name} ${currentAngleObj.titleEn}`}
                    className={`max-h-[210px] sm:max-h-[270px] w-auto max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.7)] select-none animate-in fade-in zoom-in-95 duration-200 ${
                      activeAngle === "wheel" ? "rounded-3xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900" : ""
                    }`}
                    style={{
                      filter: activeAngle === "360" ? (
                        activeColor.id === "gold" ? "sepia(0.3) saturate(1.2)" :
                        activeColor.id === "black" ? "brightness(0.7) contrast(1.1)" :
                        activeColor.id === "red" ? "hue-rotate(330deg) saturate(1.4)" :
                        activeColor.id === "green" ? "hue-rotate(85deg) saturate(0.9)" :
                        activeColor.id === "white" ? "brightness(1.15) contrast(1.05)" : "none"
                      ) : "none"
                    }}
                  />

                  {/* Active Angle Overlay Badge */}
                  <div className="absolute -bottom-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-md flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>{currentAngleObj.titleKh} ({currentAngleObj.titleEn})</span>
                  </div>
                </div>
              </div>
            ) : (
              /* High-End Cockpit Interior View */
              <div className="relative w-full max-w-3xl h-[230px] sm:h-[290px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
                <img
                  src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"
                  alt="Interior cockpit"
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40" />
                <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-white">
                  <div>
                    <div className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">ផ្នែកខាងក្នុង (Luxury Cockpit)</div>
                    <div className="text-xs sm:text-sm font-bold">Panoramic Display & Ambient Nappa Leather Package</div>
                  </div>
                  <span className="text-[10.5px] font-mono bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    12.3-inch Digital Cockpit
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CONFIGURATOR CONTROLS: 5-Column Floating Panel Card                     */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 p-4 sm:p-5 shadow-sm z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 items-start">
            
            {/* Col 1: Trim / Equipment Level */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                Trim & Equipment
              </label>
              <div className="relative">
                <select
                  value={selectedTrim}
                  onChange={(e) => setSelectedTrim(e.target.value as any)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs pr-8"
                >
                  <option value="core">Core Edition (+$0)</option>
                  <option value="concept">Concept Luxury (+${(2800).toLocaleString()})</option>
                  <option value="performance">TRD Pro Performance (+${(5400).toLocaleString()})</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {selectedTrim === "core" ? "Standard factory balance" :
                 selectedTrim === "concept" ? "Panoramic roof & leather trim" : "Fox Shocks & forged off-road"}
              </div>
            </div>

            {/* Col 2: Body Color Swatches */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                Body Color
              </label>
              <div className="flex items-center gap-2">
                {colors.map((c, i) => {
                  const isSelected = i === selectedColorIndex;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColorIndex(i)}
                      className={`relative w-8 h-8 rounded-full cursor-pointer transition-all duration-150 p-0.5 ${
                        isSelected
                          ? "ring-2 ring-amber-500 dark:ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-xs"
                          : "hover:scale-105 border border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100"
                      }`}
                      title={c.name}
                    >
                      <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }} />
                    </button>
                  );
                })}
              </div>
              <div className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {activeColor.name} {activeColor.price > 0 && `(+$${activeColor.price})`}
              </div>
            </div>

            {/* Col 3: Wheels Options */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                Wheels & Rims
              </label>
              <div className="flex items-center gap-2">
                {WHEEL_OPTIONS.map((w) => {
                  const isSelected = w.id === selectedWheelId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWheelId(w.id);
                        setActiveAngle("wheel");
                      }}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "ring-2 ring-amber-500 dark:ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-slate-900 text-white scale-110 shadow-xs"
                          : "border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                      }`}
                      title={w.name}
                    >
                      <Disc className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
              <div className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {activeWheel.name}
              </div>
            </div>

            {/* Col 4: Brakes & Calipers */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                Brakes & Calipers
              </label>
              <div className="flex items-center gap-2">
                {BRAKE_OPTIONS.map((b) => {
                  const isSelected = b.id === selectedBrakeId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrakeId(b.id);
                        setActiveAngle("wheel");
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.hex }} />
                      <span>{b.colorName}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200">
                {activeBrake.price > 0 ? `Brembo Red (+${activeBrake.price})` : "Standard Calipers"}
              </div>
            </div>

            {/* Col 5: Packages & Options */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                Option Packages
              </label>
              <div className="relative">
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs pr-8"
                >
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} {pkg.price > 0 ? `(+$${pkg.price.toLocaleString()})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {activePackage.desc}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM GALLERY: 6 Angle Thumbnails Matching the Reference Image        */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {ANGLE_GALLERY.map((angle) => {
              const isActive = (viewMode === "interior" && angle.id === "interior") || 
                               (viewMode === "exterior" && activeAngle === angle.id);
              const angleThumbImg = getAngleImage(angle.id);

              return (
                <button
                  key={angle.id}
                  onClick={() => {
                    if (angle.id === "interior") {
                      setViewMode("interior");
                    } else {
                      setViewMode("exterior");
                    }
                    setActiveAngle(angle.id as any);
                  }}
                  className={`group relative h-20 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer flex flex-col justify-end p-2 text-left bg-white dark:bg-slate-900 shadow-xs ${
                    isActive
                      ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02]"
                      : "border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Distinct Angle Thumbnail Image */}
                  <img
                    src={angleThumbImg}
                    alt={angle.titleEn}
                    className={`absolute inset-0 w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300 ${
                      angle.id === "interior" ? "object-cover p-0" : "object-contain"
                    }`}
                    style={{
                      filter: angle.id === "360" ? (
                        activeColor.id === "gold" ? "sepia(0.3) saturate(1.2)" :
                        activeColor.id === "black" ? "brightness(0.7)" :
                        activeColor.id === "red" ? "hue-rotate(330deg)" : "none"
                      ) : "none"
                    }}
                  />

                  {/* Top Badge: 360 or Angle Tag */}
                  {angle.is360 ? (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
                      360°
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-amber-400 text-[8.5px] font-black uppercase tracking-wider border border-white/10">
                      {angle.titleKh}
                    </span>
                  )}

                  {/* Gradient Label Overlay with Khmer & English */}
                  <div className="relative z-10 bg-slate-950/85 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black text-white truncate">
                        {angle.titleKh}
                      </span>
                      <span className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider truncate hidden sm:inline">
                        {angle.titleEn}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FULL TECHNICAL SPECIFICATIONS & ALL DATA OVERLAY MODAL                    */}
        {/* ========================================================================= */}
        {showAllSpecsModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      លក្ខណៈបច្ចេកទេស និងទិន្នន័យលម្អិត (Full Specifications)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.brand} {product.name} • {product.year}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllSpecsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Complete Specs Grid */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                
                {/* 1. Core Identity & Pricing */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[11px] font-black uppercase text-amber-500 mb-2.5 tracking-wider">
                    ព័ត៌មានទូទៅ និងតម្លៃ (General & Pricing)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ម៉ាក / ផលិតករ៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.brand}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ម៉ូឌែល / ជំនាន់៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.model || product.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ឆ្នាំផលិត (Year)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.year}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">តម្លៃលក់មូលដ្ឋាន៖</span>
                      <span className="font-black text-amber-500 font-mono">${product.base_price.toLocaleString()} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">តម្លៃបង់រំលស់ប៉ាន់ស្មាន៖</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">~${Math.round((product.base_price * 0.7 * 0.085) / 12)}/ខែ</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">កូដទំនិញ (SKU/VIN)៖</span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{product.sku}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Powertrain & Performance */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[11px] font-black uppercase text-amber-500 mb-2.5 tracking-wider">
                    កម្លាំងម៉ាស៊ីន និងការស៊ីប្រេង (Performance & Economy)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ទំហំម៉ាស៊ីន (Engine)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.specs?.Engine || "2.4L Turbocharged"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">កម្លាំងសេះ (Horsepower)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.specs?.Power || "278 HP / 317 lb-ft"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">កម្រិតស៊ីប្រេង/ថាមពល (MPG/Range)៖</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{product.mpg_range || "28 MPG Combined"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ប្រព័ន្ធបើកបរ (Drivetrain)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.specs?.Drivetrain || "AWD (All-Wheel Drive)"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ប្រអប់លេខ (Transmission)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.specs?.Transmission || "8-Speed Direct Shift Automatic"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ប្រភេទថាមពល (Powertrain)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.powertrain_type || product.top_label || "Gasoline / Hybrid"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Interior, Comfort & Safety */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[11px] font-black uppercase text-amber-500 mb-2.5 tracking-wider">
                    ផ្នែកខាងក្នុង និងប្រព័ន្ធសុវត្ថិភាព (Interior & Safety)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ចំនួនកៅអីអង្គុយ (Seating)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.seating || 5} កៅអី (Premium Leather)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">អេក្រង់កម្សាន្ត (Infotainment)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">12.3-inch Touchscreen with Apple CarPlay</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ប្រព័ន្ធសុវត្ថិភាព (Safety Sense)៖</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Pre-Collision, Lane Tracing, Blind Spot</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ការធានារោងចក្រ (Warranty)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.specs?.Warranty || "5 ឆ្នាំ ឬ 100,000 គីឡូម៉ែត្រ"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">សាខាមានស្តុក (Showroom)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBranch?.name || "Phnom Penh Showroom"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ស្ថានភាពរថយន្ត (Condition)៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.condition || "ថ្មីខ្លាញ់គោ (Brand New 100%)"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAllSpecsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                >
                  ត្រឡប់ក្រោយ (Back to 360)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllSpecsModal(false);
                      onOpenOrderModal?.(product, activeColor.name);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>កក់រថយន្តនេះភ្លាមៗ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
