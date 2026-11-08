"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Gauge,
  Sliders,
  Check,
  Sparkles,
  Layers,
  Car,
  Compass,
  Truck,
  Zap,
  Users,
  Bike,
  Wrench,
  Shield,
  Flame,
  BatteryCharging,
  Package,
  Navigation,
  Rocket,
  Trophy,
  Tag,
  Key,
  Fuel,
  Heart,
  Star,
  Cpu,
  Activity,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import {
  MarqueeConfig,
  CategoryItem,
  BrandItem,
  ICON_OPTIONS,
  DEFAULT_MARQUEE_CONFIG,
  fetchServerMarqueeConfig,
  persistMarqueeConfig,
  resetServerMarqueeConfig
} from "./marqueeConfig";

export interface MarqueeAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: MarqueeConfig) => void;
  isEmbedded?: boolean; // if true, renders directly as dashboard panel without modal overlay
}

export const MarqueeAdminModal: React.FC<MarqueeAdminModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isEmbedded = false,
}) => {
  const [config, setConfig] = useState<MarqueeConfig>(DEFAULT_MARQUEE_CONFIG);
  const [activeTab, setActiveTab] = useState<"speed" | "categories" | "brands">("categories");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Icon Picker State
  const [pickingIconForIndex, setPickingIconForIndex] = useState<number | null>(null);

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("all");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Brand Form State
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandId, setNewBrandId] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  // Editing items inline
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingBrandIndex, setEditingBrandIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen || isEmbedded) {
      void fetchServerMarqueeConfig().then((data) => {
        setConfig(data);
      });
    }
  }, [isOpen, isEmbedded]);

  if (!isOpen && !isEmbedded) return null;

  const handleSpeedPreset = (seconds: number) => {
    setConfig((prev) => ({ ...prev, speed: seconds }));
  };

  // --- Category Actions ---
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const autoId = newCatId.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newCat: CategoryItem = {
      id: autoId,
      name: newCatName.trim(),
      iconKey: newCatIcon,
    };
    setConfig((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    setNewCatName("");
    setNewCatId("");
    setNewCatIcon("all");
    setIsAddingCat(false);
  };

  const handleDeleteCategory = (idx: number) => {
    if (config.categories.length <= 1) {
      alert("អ្នកត្រូវទុកយ៉ាងហោចណាស់ ១ ប្រភេទ!");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateCategoryIcon = (catIdx: number, iconKey: string) => {
    setConfig((prev) => {
      const updated = [...prev.categories];
      updated[catIdx] = { ...updated[catIdx], iconKey };
      return { ...prev, categories: updated };
    });
    setPickingIconForIndex(null);
  };

  const handleUpdateCategoryName = (catIdx: number, name: string) => {
    setConfig((prev) => {
      const updated = [...prev.categories];
      updated[catIdx] = { ...updated[catIdx], name };
      return { ...prev, categories: updated };
    });
  };

  // --- Brand Actions ---
  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const autoId = newBrandId.trim() || newBrandName.trim();
    const newBrand: BrandItem = {
      id: autoId,
      name: newBrandName.trim(),
    };
    setConfig((prev) => ({
      ...prev,
      brands: [...prev.brands, newBrand],
    }));
    setNewBrandName("");
    setNewBrandId("");
    setIsAddingBrand(false);
  };

  const handleDeleteBrand = (idx: number) => {
    if (config.brands.length <= 1) {
      alert("អ្នកត្រូវទុកយ៉ាងហោចណាស់ ១ ប្រេន!");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateBrandName = (brandIdx: number, name: string) => {
    setConfig((prev) => {
      const updated = [...prev.brands];
      updated[brandIdx] = { ...updated[brandIdx], name };
      return { ...prev, brands: updated };
    });
  };

  // --- Save / Reset ---
  const handleSave = async () => {
    setSaving(true);
    const ok = await persistMarqueeConfig(config);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      if (onSaved) onSaved(config);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleReset = async () => {
    if (!confirm("តើអ្នកចង់កំណត់ Marquee ត្រឡប់មកទម្រង់ដើមវិញ (Reset to Default) មែនទេ?")) return;
    setSaving(true);
    const def = await resetServerMarqueeConfig();
    setConfig(def);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Render icon preview helper
  const renderIcon = (key: string, className = "w-5 h-5") => {
    const found = ICON_OPTIONS.find((o) => o.key === key);
    if (found) {
      const IconComponent = found.icon;
      return <IconComponent className={className} />;
    }
    return <Car className={className} />;
  };

  const content = (
    <div className="flex flex-col h-full max-h-[85vh] text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              គ្រប់គ្រង Categories, Brands & កំណត់ល្បឿន
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              បន្ថែម/លុប Category, ប្តូរ Icon និងកំណត់ល្បឿនរត់របស់ Marquee
            </p>
          </div>
        </div>

        {!isEmbedded && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-3 text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "categories"
              ? "border-amber-400 text-amber-500"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({config.categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brands")}
          className={`pb-3 px-3 text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "brands"
              ? "border-amber-400 text-amber-500"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Brands ({config.brands.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("speed")}
          className={`pb-3 px-3 text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "speed"
              ? "border-amber-400 text-amber-500"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>កំណត់ល្បឿន ({config.speed}s)</span>
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>បានរក្សាទុកការផ្លាស់ប្តូរជោគជ័យ! ការផ្លាស់ប្តូរត្រូវបាន Update លើគេហទំព័រភ្លាមៗ។</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: CATEGORIES MANAGEMENT
           ======================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  បញ្ជី Categories បច្ចុប្បន្ន
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ចុចលើ Icon ដើម្បីប្តូររូបភាពថ្មី ឬចុចលុប/បន្ថែមប្រភេទថ្មី
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCat(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែម Category ថ្មី</span>
              </button>
            </div>

            {/* Form Add New Category */}
            {isAddingCat && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/80 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-500 uppercase">
                    ទម្រង់បន្ថែមប្រភេទរថយន្តថ្មី
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    បិទ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      ឈ្មោះបង្ហាញ (Category Name) *
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="ឧ. Sedan & Sport ឬ Mini Car"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Slug / ID (ឧ. sport, mini)
                    </label>
                    <input
                      type="text"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="ឧ. sport"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      ជ្រើសរើស Icon
                    </label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-amber-400"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300"
                  >
                    យល់ព្រមបន្ថែម
                  </button>
                </div>
              </div>
            )}

            {/* Category Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.categories.map((cat, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-400/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon Button (Click to change) */}
                    <button
                      type="button"
                      onClick={() => setPickingIconForIndex(pickingIconForIndex === idx ? null : idx)}
                      title="ចុចដើម្បីប្តូរ Icon"
                      className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-500 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center shrink-0 transition-all cursor-pointer relative group"
                    >
                      {renderIcon(cat.iconKey, "w-5 h-5")}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-900 rounded-full border border-white text-[8px] flex items-center justify-center text-white">
                        ✎
                      </span>
                    </button>

                    {/* Name Input / Display */}
                    <div className="min-w-0 flex-1">
                      {editingCatIndex === idx ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => handleUpdateCategoryName(idx, e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-lg border border-amber-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingCatIndex(null)}
                            className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {cat.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingCatIndex(idx)}
                              className="text-slate-400 hover:text-amber-500 text-[10px]"
                            >
                              ✎
                            </button>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            ID: {cat.id} • Icon: {cat.iconKey}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(idx)}
                      title="លុប Category នេះ"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Icon Picker Panel (when clicked) */}
            {pickingIconForIndex !== null && (
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      ជ្រើសរើស Icon ថ្មីសម្រាប់: {config.categories[pickingIconForIndex]?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickingIconForIndex(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    បិទ
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {ICON_OPTIONS.map((opt) => {
                    const isSelected = config.categories[pickingIconForIndex]?.iconKey === opt.key;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleUpdateCategoryIcon(pickingIconForIndex, opt.key)}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 font-black border-amber-400 shadow-sm scale-105"
                            : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-200"
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] truncate w-full text-center leading-tight">
                          {opt.key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: BRANDS MANAGEMENT
           ======================================================== */}
        {activeTab === "brands" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  បញ្ជី Brands បច្ចុប្បន្ន
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  បន្ថែមប្រេនរថយន្តថ្មី ឬលុបប្រេនដែលមិនមានក្នុងស្តុក
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingBrand(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែម Brand ថ្មី</span>
              </button>
            </div>

            {/* Form Add New Brand */}
            {isAddingBrand && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/80 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-500 uppercase">
                    ទម្រង់បន្ថែមប្រេនថ្មី
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingBrand(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    បិទ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      ឈ្មោះ Brand (Brand Name) *
                    </label>
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="ឧ. Audi, Porsche, Mazda, Honda"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Brand ID (Slug)
                    </label>
                    <input
                      type="text"
                      value={newBrandId}
                      onChange={(e) => setNewBrandId(e.target.value)}
                      placeholder="ឧ. Porsche"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingBrand(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300"
                  >
                    យល់ព្រមបន្ថែម
                  </button>
                </div>
              </div>
            )}

            {/* Brand Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {config.brands.map((brand, idx) => (
                <div
                  key={`${brand.id}-${idx}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-400/60 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingBrandIndex === idx ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={brand.name}
                            onChange={(e) => handleUpdateBrandName(idx, e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-lg border border-amber-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingBrandIndex(null)}
                            className="p-1 text-emerald-500"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {brand.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingBrandIndex(idx)}
                            className="text-slate-400 hover:text-amber-500 text-[10px]"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        ID: {brand.id}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(idx)}
                    title="លុប Brand នេះ"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SPEED CONTROL (កំណត់ល្បឿន)
           ======================================================== */}
        {activeTab === "speed" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                កំណត់ល្បឿនរត់របស់ Marquee (Animation Speed)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ជ្រើសរើសកម្រិតល្បឿនដែលងាយស្រួលមើលបំផុត (រយៈពេលគិតជាវិនាទីសម្រាប់មួយជុំ)
              </p>
            </div>

            {/* Speed Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "🚀 លឿនខ្លាំង", sec: 20, desc: "20s (Fast)" },
                { label: "⚡ លឿន", sec: 30, desc: "30s (Brisk)" },
                { label: "🎯 ល្មម (Default)", sec: 40, desc: "40s (Standard)" },
                { label: "🚶 យឺត", sec: 55, desc: "55s (Smooth)" },
                { label: "🐢 យឺតខ្លាំង", sec: 75, desc: "75s (Calm)" },
              ].map((p) => {
                const isSelected = config.speed === p.sec;
                return (
                  <button
                    key={p.sec}
                    type="button"
                    onClick={() => handleSpeedPreset(p.sec)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-black border-amber-400 shadow-md scale-102"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-400"
                    }`}
                  >
                    <div className="text-sm font-black">{p.label}</div>
                    <div className={`text-[10px] font-mono mt-1 ${isSelected ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Speed Slider */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  រំកិលតាមចិត្ត (Custom Slider)
                </span>
                <span className="text-base font-black text-amber-500 font-mono px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                  {config.speed} វិនាទី (s)
                </span>
              </div>

              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={config.speed}
                onChange={(e) => handleSpeedPreset(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>10s (លឿនបំផុត)</span>
                <span>40s (កម្រិតធម្មតា)</span>
                <span>100s (យឺតបំផុត)</span>
              </div>
            </div>

            {/* Live Animation Speed Test Box */}
            <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2 overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                តេស្តសាកល្បងល្បឿនបច្ចុប្បន្ន (Live Speed Test)
              </span>
              <div className="w-full overflow-hidden relative py-2">
                <div
                  className="flex gap-3 whitespace-nowrap"
                  style={{
                    animation: `marquee-forward ${config.speed}s linear infinite`,
                    width: "max-content",
                  }}
                >
                  {config.categories.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2"
                    >
                      {renderIcon(c.iconKey, "w-4 h-4")}
                      <span>{c.name}</span>
                    </div>
                  ))}
                  {config.categories.slice(0, 4).map((c) => (
                    <div
                      key={`test-dup-${c.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2"
                    >
                      {renderIcon(c.iconKey, "w-4 h-4")}
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 rounded-b-3xl">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>កំណត់ដើម (Reset Default)</span>
        </button>

        <div className="flex items-center gap-2">
          {!isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {saving ? (
              <span>កំពុងរក្សាទុក...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>រក្សាទុកការផ្លាស់ប្តូរ (Save Changes)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {content}
      </div>
    </div>
  );
};

