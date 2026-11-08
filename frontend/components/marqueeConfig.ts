"use client";

import React from "react";
import {
  Car,
  Compass,
  Gauge,
  Truck,
  Zap,
  Users,
  Bike,
  Wrench,
  Shield,
  Sparkles,
  Flame,
  Clock,
  BatteryCharging,
  Package,
  Navigation,
  Rocket,
  Trophy,
  Tag,
  Key,
  Layers,
  Fuel,
  Heart,
  Cpu,
  Globe,
  Activity,
  Sliders,
  CheckCircle2,
  Star
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  iconKey: string;
}

export interface BrandItem {
  id: string;
  name: string;
  iconKey?: string;
}

export interface MarqueeConfig {
  speed: number; // in seconds (e.g. 40)
  categories: CategoryItem[];
  brands: BrandItem[];
}

// Visual registry of selectable icons
export const ICON_OPTIONS: Array<{ key: string; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: "all", label: "រថយន្តទូទៅ (Car)", icon: Car },
  { key: "suv", label: "ដំណើរផ្លូវឆ្ងាយ (Compass)", icon: Compass },
  { key: "sedan", label: "ល្បឿនប្រណិត (Gauge)", icon: Gauge },
  { key: "truck", label: "ដឹកទំនិញធ្ងន់ (Truck)", icon: Truck },
  { key: "ev", label: "ថាមពលអគ្គិសនី (Zap)", icon: Zap },
  { key: "minivan", label: "គ្រួសារច្រើនកៅអី (Users)", icon: Users },
  { key: "ebike", label: "កង់អគ្គិសនី (Bike)", icon: Bike },
  { key: "parts", label: "គ្រឿងបន្លាស់ (Wrench)", icon: Wrench },
  { key: "shield", label: "ធានាគុណភាព (Shield)", icon: Shield },
  { key: "sparkles", label: "ម៉ូដែលឆ្នើម (Sparkles)", icon: Sparkles },
  { key: "flame", label: "ពេញនិយមខ្លាំង (Flame)", icon: Flame },
  { key: "battery", label: "អាគុយសាកលឿន (Battery)", icon: BatteryCharging },
  { key: "package", label: "ដឹកជញ្ជូន (Package)", icon: Package },
  { key: "navigation", label: "រុករកទិសដៅ (Navigation)", icon: Navigation },
  { key: "rocket", label: "ល្បឿនលឿនខ្លាំង (Rocket)", icon: Rocket },
  { key: "trophy", label: "ជើងឯកលក់ដាច់ (Trophy)", icon: Trophy },
  { key: "tag", label: "តម្លៃពិសេស (Tag)", icon: Tag },
  { key: "key", label: "កក់ជួលភ្លាមៗ (Key)", icon: Key },
  { key: "layers", label: "គ្រប់ផ្នែក (Layers)", icon: Layers },
  { key: "fuel", label: "សន្សំសំចៃប្រេង (Fuel)", icon: Fuel },
  { key: "heart", label: "ពេញចិត្តបំផុត (Heart)", icon: Heart },
  { key: "star", label: "ផ្កាយប្រណិត (Star)", icon: Star },
  { key: "cpu", label: "បច្ចេកវិទ្យាឆ្លាតវៃ (Cpu)", icon: Cpu },
  { key: "activity", label: "កម្លាំងម៉ាស៊ីន (Activity)", icon: Activity },
];

export const DEFAULT_MARQUEE_CONFIG: MarqueeConfig = {
  speed: 40,
  categories: [
    { id: "all", name: "ទាំងអស់ (All Products)", iconKey: "all" },
    { id: "suv", name: "SUV & Crossover", iconKey: "suv" },
    { id: "sedan", name: "Sedan & Sport", iconKey: "sedan" },
    { id: "truck", name: "Truck & Pickup", iconKey: "truck" },
    { id: "ev", name: "Electric & Hybrid", iconKey: "ev" },
    { id: "minivan", name: "Minivan & Family", iconKey: "minivan" },
    { id: "ebike", name: "កង់អគ្គិសនី (E-Bikes)", iconKey: "ebike" },
    { id: "parts", name: "គ្រឿងបន្លាស់ (Parts)", iconKey: "parts" },
  ],
  brands: [
    { id: "all", name: "គ្រប់ប្រេន (All Brands)", iconKey: "sparkles" },
    { id: "Toyota", name: "Toyota", iconKey: "Toyota" },
    { id: "Lexus", name: "Lexus", iconKey: "Lexus" },
    { id: "Ford", name: "Ford", iconKey: "Ford" },
    { id: "BYD", name: "BYD", iconKey: "BYD" },
    { id: "Tesla", name: "Tesla", iconKey: "Tesla" },
    { id: "Hyundai", name: "Hyundai", iconKey: "Hyundai" },
    { id: "Kia", name: "KIA", iconKey: "Kia" },
    { id: "BMW", name: "BMW", iconKey: "BMW" },
    { id: "Mercedes-Benz", name: "Mercedes", iconKey: "Mercedes-Benz" },
    { id: "Peugeot", name: "Peugeot", iconKey: "Peugeot" },
  ],
};

const STORAGE_KEY = "drivex_marquee_config_v2";

export function getStoredMarqueeConfig(): MarqueeConfig {
  if (typeof window === "undefined") {
    return DEFAULT_MARQUEE_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MARQUEE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      speed: typeof parsed.speed === "number" && parsed.speed >= 5 ? parsed.speed : DEFAULT_MARQUEE_CONFIG.speed,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_MARQUEE_CONFIG.categories,
      brands: Array.isArray(parsed.brands) && parsed.brands.length > 0 ? parsed.brands : DEFAULT_MARQUEE_CONFIG.brands,
    };
  } catch (e) {
    return DEFAULT_MARQUEE_CONFIG;
  }
}

export async function fetchServerMarqueeConfig(): Promise<MarqueeConfig> {
  try {
    const res = await fetch(`/api/marquee?_t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.categories) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {
    // fallback to local storage
  }
  return getStoredMarqueeConfig();
}

export async function persistMarqueeConfig(config: MarqueeConfig): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("marquee_config_updated", { detail: config }));
      
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("drivex_marquee_channel");
        bc.postMessage(config);
        bc.close();
      }
    } catch (e) {
      console.error("Local storage / broadcast error:", e);
    }
  }

  try {
    const res = await fetch("/api/marquee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (e) {
    console.error("Fetch API save error:", e);
    return false;
  }
}

export async function resetServerMarqueeConfig(): Promise<MarqueeConfig> {
  await persistMarqueeConfig(DEFAULT_MARQUEE_CONFIG);
  return DEFAULT_MARQUEE_CONFIG;
}

