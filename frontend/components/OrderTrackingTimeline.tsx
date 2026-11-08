"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  FileCheck,
  KeyRound,
  RotateCw,
  Copy,
  Check,
  Phone,
  MapPin,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Car,
  Package,
  ExternalLink
} from "lucide-react";

export interface OrderTrackingTimelineProps {
  orderNo: string;
  initialOrder?: any;
  checkoutMode?: "VEHICLE" | "CART";
  vehicleName?: string;
  vehicleImage?: string;
  vehicleColor?: string;
  branchName?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  compact?: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

interface MilestoneStage {
  id: number;
  key: string;
  titleKh: string;
  titleEn: string;
  descriptionKh: string;
  descriptionEn: string;
  actorKh: string;
  icon: React.ElementType;
  estimatedTime?: string;
}

const MILESTONE_STAGES: MilestoneStage[] = [
  {
    id: 1,
    key: "RECEIVED",
    titleKh: "បានកក់ & កត់ត្រាក្នុងប្រព័ន្ធ",
    titleEn: "Order Placed & Recorded",
    descriptionKh: "ប្រព័ន្ធ DriveX បានកត់ត្រាព័ត៌មានការកក់ទុក និងបង្កើតវិក្កយបត្រផ្លូវការជោគជ័យ។",
    descriptionEn: "Your booking and customer details are secured in DriveX Automotive Cloud.",
    actorKh: "ប្រព័ន្ធស្វ័យប្រវត្ត DriveX Platform",
    icon: CheckCircle2,
    estimatedTime: "បានសម្រេច (Done)"
  },
  {
    id: 2,
    key: "SALES_APPROVAL",
    titleKh: "ការយល់ព្រមលក់ & បញ្ជាក់កិច្ចសន្យា",
    titleEn: "Sales Approval & Agreement",
    descriptionKh: "ទីប្រឹក្សាផ្នែកលក់រថយន្ត (Sales Consultant) បានផ្ទៀងផ្ទាត់ការទូទាត់ និងអនុម័តកិច្ចសន្យាលក់ផ្លូវការ។",
    descriptionEn: "Auto-car sales advisor verifies transaction, validates invoice & prepares vehicle registration documents.",
    actorKh: "ទីប្រឹក្សាផ្នែកលក់ Showroom Sales Team",
    icon: FileCheck,
    estimatedTime: "១៥ - ៣០ នាទី"
  },
  {
    id: 3,
    key: "PDI_INSPECTION",
    titleKh: "ត្រួតពិនិត្យបច្ចេកទេស PDI ១៥០ ចំណុច",
    titleEn: "150-Point Technical PDI",
    descriptionKh: "ក្រុមវិស្វករជំនាញត្រួតពិនិត្យប្រព័ន្ធសុវត្ថិភាព ម៉ាស៊ីន អាគុយ EV ហ្វ្រាំង និងសម្អាត Detailing រថយន្ត ១០០%។",
    descriptionEn: "Certified master technicians perform 150-point safety, powertrain, battery diagnostics, and full detailing.",
    actorKh: "មជ្ឈមណ្ឌលបច្ចេកទេស DriveX PDI Center",
    icon: ShieldCheck,
    estimatedTime: "១ - ២ ម៉ោង"
  },
  {
    id: 4,
    key: "TRANSPORT",
    titleKh: "ការដឹកជញ្ជូនរថយន្ត (In-Transit)",
    titleEn: "Vehicle Transport & Logistics",
    descriptionKh: "រថយន្តត្រូវបានផ្ទុកលើរថយន្តដឹកជញ្ជូនពិសេស (Enclosed Auto Carrier) កំពុងធ្វើដំណើរឆ្ពោះទៅកាន់ Showroom ឬគេហដ្ឋាន។",
    descriptionEn: "Secured enclosed car transporter is dispatched from Central Logistics Hub with live GPS tracking.",
    actorKh: "ផ្នែកដឹកជញ្ជូន DriveX Logistics & Freight",
    icon: Truck,
    estimatedTime: "១ - ៣ ថ្ងៃធ្វើការ"
  },
  {
    id: 5,
    key: "HANDOVER",
    titleKh: "មកដល់ Showroom & ប្រគល់សោររថយន្ត",
    titleEn: "Ready for Pickup & Handover",
    descriptionKh: "រថយន្តបានមកដល់សាខា Showroom រួចរាល់។ អតិថិជនអាចអញ្ជើញមកពិនិត្យជាក់ស្ដែង បើកបរសាកល្បង និងទទួលប្រគល់សោររថយន្ត!",
    descriptionEn: "Vehicle is staged at Showroom for customer VIP walkthrough, final inspection, and key ceremony.",
    actorKh: "ប្រធានសាខា Showroom & VIP Handover Specialist",
    icon: KeyRound,
    estimatedTime: "រួចរាល់សម្រាប់ការប្រគល់"
  }
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  orderNo,
  initialOrder,
  checkoutMode = "VEHICLE",
  vehicleName,
  vehicleImage,
  vehicleColor,
  branchName,
  customerName,
  customerPhone,
  deliveryAddress,
  compact = false
}) => {
  const [order, setOrder] = useState<any>(initialOrder || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "DETAILS">("TIMELINE");

  // Fetch / Sync order from API
  const fetchOrder = useCallback(async (quiet = true) => {
    if (!orderNo) return;
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/orders/track?reference=${encodeURIComponent(orderNo)}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setOrder(json.data);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      // Quiet fail if network hiccups
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, [orderNo]);

  // Polling every 5 seconds for live status updates
  useEffect(() => {
    if (!orderNo) return;
    fetchOrder(true);
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [orderNo, fetchOrder]);

  const handleCopyOrderNo = () => {
    if (!orderNo) return;
    navigator.clipboard?.writeText(orderNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine current active milestone index (1 to 5)
  // Mapping order.status:
  // PENDING -> Stage 1 Done, Stage 2 Active (waiting for dealer approval)
  // CONFIRMED -> Stage 2 Done, Stage 3 Active (PDI Inspection)
  // PROCESSING / PREPARING / READY_FOR_DELIVERY -> Stage 3 Done, Stage 4 Active (Transport)
  // READY_FOR_PICKUP -> Stage 4 Done, Stage 5 Active (Ready at Showroom)
  // COMPLETED -> Stage 5 Done (All 5 Done)
  // CANCELLED -> -1
  const rawStatus = (order?.status || initialOrder?.status || "CONFIRMED").toUpperCase();

  const getActiveStageIndex = (status: string): number => {
    switch (status) {
      case "PENDING":
        return 2; // Step 2 is in-progress (Awaiting sales approval)
      case "CONFIRMED":
        return 3; // Step 3 is in-progress (PDI Inspection)
      case "PROCESSING":
      case "PREPARING":
      case "READY_FOR_DELIVERY":
        return 4; // Step 4 is in-progress (Transport / Delivery)
      case "READY_FOR_PICKUP":
        return 5; // Step 5 is in-progress (Ready at Showroom for pickup)
      case "COMPLETED":
        return 6; // All 5 completed!
      case "CANCELLED":
        return -1;
      default:
        return 2;
    }
  };

  const currentStageIndex = getActiveStageIndex(rawStatus);

  // Status badge styling and label
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          labelKh: "រង់ចាំការយល់ព្រមលក់ (Awaiting Sales Approval)",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300",
          dotColor: "bg-amber-500",
          headline: "ការកក់ត្រូវបានកត់ត្រា — រង់ចាំទីប្រឹក្សាផ្នែកលក់ផ្ទៀងផ្ទាត់កិច្ចសន្យា"
        };
      case "CONFIRMED":
        return {
          labelKh: "បានយល់ព្រមលក់ & កំពុងត្រួតពិនិត្យ PDI (Sales Confirmed)",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300",
          dotColor: "bg-emerald-500",
          headline: "កិច្ចសន្យាលក់ត្រូវបានអនុម័ត — កំពុងពិនិត្យគុណភាពបច្ចេកទេសរថយន្ត ១៥០ ចំណុច"
        };
      case "PROCESSING":
      case "PREPARING":
      case "READY_FOR_DELIVERY":
        return {
          labelKh: "កំពុងដឹកជញ្ជូនរថយន្ត (Vehicle In-Transit)",
          badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300",
          dotColor: "bg-blue-500",
          headline: "រថយន្តបានឆ្លងកាត់ការត្រួតពិនិត្យ — កំពុងធ្វើដំណើរឆ្ពោះទៅកាន់ Showroom / គេហដ្ឋាន"
        };
      case "READY_FOR_PICKUP":
        return {
          labelKh: "មកដល់ Showroom / ត្រៀមប្រគល់សោរ (Ready for Handover)",
          badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300",
          dotColor: "bg-purple-500",
          headline: "រថយន្តបានមកដល់ Showroom រួចរាល់ — សូមអញ្ជើញមកពិនិត្យជាក់ស្ដែង និងទទួលសោរ!"
        };
      case "COMPLETED":
        return {
          labelKh: "បានប្រគល់រថយន្តជោគជ័យ (Handover Completed)",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-400",
          dotColor: "bg-emerald-500",
          headline: "ការប្រគល់សោររថយន្ត និងឯកសារផ្លូវការត្រូវបានបញ្ចប់ដោយជោគជ័យ!"
        };
      case "CANCELLED":
        return {
          labelKh: "បានបោះបង់ (Cancelled)",
          badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300",
          dotColor: "bg-rose-500",
          headline: "ការកក់នេះត្រូវបានបោះបង់។ សូមទាក់ទងមកកាន់ Showroom ប្រសិនបើមានចម្ងល់។"
        };
      default:
        return {
          labelKh: "កំពុងដំណើរការ (Processing)",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
          dotColor: "bg-amber-500",
          headline: "ការកក់កំពុងស្ថិតក្នុងដំណើរការរៀបចំ"
        };
    }
  };

  const statusDisplay = getStatusDisplay(rawStatus);

  const displayVehicleName =
    order?.items?.[0]?.item_name ||
    vehicleName ||
    (checkoutMode === "CART" ? "ទំនិញគ្រឿងបន្លាស់ & E-Bikes" : "យានយន្ត DriveX");

  const displayBranchName =
    order?.branch_name ||
    branchName ||
    "Phnom Penh Main Showroom (HQ)";

  const displayCustomerName = order?.customer_name || customerName || "អតិថិជនកិត្តិយស";
  const displayCustomerPhone = order?.customer_phone || customerPhone || "012 888 999";

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden mb-8 transition-all">
      
      {/* 1. Header & Live Indicator Bar */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>សកម្មភាព និងដំណើរការកក់ (Order Tracking)</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusDisplay.badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusDisplay.dotColor} animate-pulse`} />
                <span>{statusDisplay.labelKh}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-400 flex items-center gap-2">
                <span>{orderNo || "VH-PENDING"}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderNo}
                  title="ចម្លងលេខកូដកក់"
                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </h3>
              {copied && <span className="text-[11px] text-emerald-400 font-bold">បានចម្លងរួចរាល់!</span>}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              {statusDisplay.headline}
            </p>
          </div>

          {/* Quick Refresh & Auto-Sync Pill */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => fetchOrder(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>{isRefreshing ? "កំពុង Sync..." : "ពិនិត្យផ្ទាល់ (Live Sync)"}</span>
            </button>
            <div className="text-[10px] text-slate-400 font-mono">
              Auto-sync: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Visual 5-Stage Milestone Stepper */}
      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Car className="w-4 h-4 text-amber-500" />
            <span>ដំណាក់កាលនៃសកម្មភាពកក់ និងដឹកជញ្ជូនរថយន្ត (Milestone Progress)</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-500">
            {currentStageIndex > 5 ? "៥ / ៥ សម្រេច ១០០%" : `ដំណាក់កាលទី ${Math.min(currentStageIndex, 5)} នៃ ៥`}
          </span>
        </div>

        {/* Stepper Grid on Desktop / Vertical on Mobile */}
        <div className="relative">
          
          {/* Progress Bar Line Background */}
          <div className="hidden lg:block absolute top-6 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
            <div
              className="h-full bg-linear-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-700 ease-out"
              style={{
                width:
                  currentStageIndex <= 1
                    ? "0%"
                    : currentStageIndex === 2
                    ? "25%"
                    : currentStageIndex === 3
                    ? "50%"
                    : currentStageIndex === 4
                    ? "75%"
                    : "100%"
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-2">
            {MILESTONE_STAGES.map((stg) => {
              const isPast = currentStageIndex > stg.id;
              const isCurrent = currentStageIndex === stg.id;
              const isFuture = currentStageIndex < stg.id;
              const IconComp = stg.icon;

              return (
                <div
                  key={stg.id}
                  className={`relative flex lg:flex-col items-start lg:items-center text-left lg:text-center p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 shadow-sm"
                      : isPast
                      ? "bg-white/60 dark:bg-slate-800/40 border border-transparent"
                      : "opacity-60 bg-transparent"
                  }`}
                >
                  {/* Step Circle with Icon */}
                  <div className="relative z-10 shrink-0 mr-3 lg:mr-0 lg:mb-2.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isPast
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                          : isCurrent
                          ? "bg-amber-400 text-slate-950 font-black ring-4 ring-amber-400/30 animate-pulse shadow-md shadow-amber-400/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {isPast ? <Check className="w-6 h-6 stroke-[3]" /> : <IconComp className="w-5 h-5" />}
                    </div>

                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Stage Texts */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 lg:justify-center">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isCurrent
                            ? "text-amber-600 dark:text-amber-400"
                            : isPast
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {isPast ? "សម្រេច" : isCurrent ? "កំពុងដំណើរការ" : `ជំហានទី ${stg.id}`}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 leading-snug line-clamp-2">
                      {stg.titleKh}
                    </h4>

                    <div className="text-[10px] text-slate-400 font-medium hidden sm:block truncate mt-0.5">
                      {stg.titleEn}
                    </div>

                    {isCurrent && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                        <span>{stg.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 3. Real-time Activity Feed & In-Transit Live Simulation */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Dynamic Highlight Card for Current Active Milestone */}
        {currentStageIndex === 2 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                សកម្មភាពកំពុងដំណើរការ • ជំហានទី ២
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                ការយល់ព្រមលក់ & បញ្ជាក់កិច្ចសន្យាពីទីប្រឹក្សា Showroom
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                ទីប្រឹក្សាផ្នែកលក់រថយន្តកំពុងផ្ទៀងផ្ទាត់ការកក់ប្រាក់ និងរៀបចំកិច្ចសន្យាផ្លូវការ។ លោកអ្នកនឹងទទួលបានការទូរស័ព្ទបញ្ជាក់ផ្ទាល់ក្នុងពេលឆាប់ៗនេះ។
              </p>
            </div>
          </div>
        )}

        {currentStageIndex === 3 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                សកម្មភាពកំពុងដំណើរការ • ជំហានទី ៣
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                ការត្រួតពិនិត្យគុណភាពបច្ចេកទេស (Pre-Delivery Inspection - 150 Points)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] font-bold">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ហ្វ្រាំង & សំបកកង់</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ម៉ាស៊ីន & អាគុយ EV</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ប្រព័ន្ធ ECU & Sensors</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Detailing សម្អាត ១០០%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStageIndex === 4 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                  សកម្មភាពកំពុងដំណើរការ • ជំហានទី ៤ (In-Transit)
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                  រថយន្តកំពុងដឹកជញ្ជូនលើរថយន្តដឹកជញ្ជូនពិសេស (Enclosed Car Carrier)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  រថយន្តកំពុងធ្វើដំណើរចេញពីឃ្លាំងកណ្តាល (Central Hub) ឆ្ពោះទៅកាន់ {displayBranchName}។
                </p>
              </div>
            </div>

            {/* Simulated Live Route Progress */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-bold mb-2">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>ឃ្លាំងកណ្តាល (Central Hub)</span>
                </span>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                  GPS Live: កំពុងធ្វើដំណើរ
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{displayBranchName}</span>
                </span>
              </div>

              <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-3/5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full" />
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {currentStageIndex >= 5 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                សកម្មភាពជោគជ័យ • រួចរាល់សម្រាប់ប្រគល់សោររថយន្ត
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                រថយន្តបានមកដល់ Showroom រួចរាល់
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                សូមអញ្ជើញមកកាន់ {displayBranchName} ដើម្បីពិនិត្យរថយន្តជាក់ស្ដែង បើកបរសាកល្បង និងទទួលប្រគល់សោររថយន្តផ្លូវការ។
              </p>
            </div>
          </div>
        )}

        {/* Detailed Activity Log Timeline */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>ប្រវត្តិសកម្មភាពជាក់ស្ដែង (Real-Time Activity Log)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">DriveX Event Log</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {MILESTONE_STAGES.map((stg) => {
              const isPast = currentStageIndex > stg.id;
              const isCurrent = currentStageIndex === stg.id;
              const isFuture = currentStageIndex < stg.id;

              return (
                <div key={stg.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? "bg-emerald-500 text-white shadow-xs"
                        : isCurrent
                        ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/30"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{stg.titleKh}</span>
                        {isPast && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                            រួចរាល់
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold animate-pulse">
                            កំពុងដំណើរការ
                          </span>
                        )}
                        {isFuture && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-medium">
                            គ្រោងទុក
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {stg.actorKh}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {stg.descriptionKh}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Action Contacts & Next Steps */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ការកក់ត្រូវបានការពារដោយការធានាប្រាក់កក់ ១០០% និងសេវាកម្មផ្លូវការ</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:+85523888999"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>ទាក់ទងទីប្រឹក្សា (+855 23 888 999)</span>
            </a>

            <button
              type="button"
              onClick={() => fetchOrder(false)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderTrackingTimeline;

