"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Car, 
  Printer, 
  FileCode, 
  Layers, 
  ExternalLink, 
  Check, 
  Download,
  Search,
  Sparkles,
  Maximize2
} from "lucide-react";

export default function SitemapDiagramPage() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const pillars = [
    {
      id: "home",
      title: "Home / Showroom",
      titleKh: "ទំព័រដើម & តាំងបង្ហាញ",
      color: "from-amber-500 to-orange-500",
      items: [
        { en: "Hero 3D Stage Carousel", kh: "ផ្ទាំងបញ្ចាំងរថយន្ត 3D" },
        { en: "Brand Selector Bar", kh: "រើសម៉ាក Toyota, BMW..." },
        { en: "Search Bar & Shortcut (Ctrl+K)", kh: "ស្វែងរករហ័ស" },
        { en: "Category Filter Tabs", kh: "ចម្រាញ់តាមប្រភេទ" },
        { en: "Vehicle Inventory Grid", kh: "តារាងរថយន្ត 44+ គ្រឿង", badge: "44 Models" },
        { en: "Quick Spec Modal", kh: "ព័ត៌មានបច្ចេកទេសរហ័ស" },
        { en: "Special Offers Banner", kh: "ប្រូម៉ូសិន & កាដូថែម" },
        { en: "Footer Directory", kh: "តំណភ្ជាប់ និងផែនទីគេហទំព័រ" }
      ]
    },
    {
      id: "lineup",
      title: "Vehicle Lineup",
      titleKh: "កាតាឡុក & ប្រភេទរថយន្ត",
      color: "from-orange-500 to-amber-600",
      items: [
        { en: "Electric & Hybrid (EVs)", kh: "រថយន្តអគ្គិសនី & កូនកាត់", badge: "25 Models" },
        { en: "Gasoline SUVs & Trucks", kh: "SUV និង ភីកអាប់សាំង", badge: "17 Models" },
        { en: "Toyota 2026 Official Lineup", kh: "ស៊េរី Toyota ពេញលេញ", badge: "27 Models" },
        { en: "Electric Bicycles (E-Bikes)", kh: "កង់អគ្គិសនី Specialized" },
        { en: "Genuine Spare Parts", kh: "គ្រឿងបន្លាស់ & ហ្វ្រាំង Brembo" },
        { en: "Engine & MPG Specs", kh: "កម្លាំងសេះ & កម្រិតស៊ីសាំង" },
        { en: "Exterior Color Swatches", kh: "ជម្រើសពណ៌រោងចក្រ ៨ ពណ៌" }
      ]
    },
    {
      id: "tools",
      title: "Automotive Tools",
      titleKh: "ឧបករណ៍ឌីជីថលឆ្លាតវៃ",
      color: "from-amber-600 to-orange-600",
      items: [
        { en: "360° Studio Configurator", kh: "ពិនិត្យមើលមួយតួខ្លួន 360°" },
        { en: "6 Camera View Angles", kh: "មុខ, ក្រោយ, ចំហៀង, ខាងក្នុង" },
        { en: "Wheels & Brembo Calipers", kh: "ជ្រើសរើសយ៉ាន់កង់ & ហ្វ្រាំង" },
        { en: "Loan & Financing Calc", kh: "គណនាការបង់រំលស់", badge: "12 - 72 Mo" },
        { en: "Multi-Brand Trade-In", kh: "វាយប្តូររថយន្តចាស់", badge: "20-Min Appraisal" },
        { en: "Test Drive Scheduler", kh: "កក់បើកបរសាកល្បងឥតគិតថ្លៃ" },
        { en: "Visual Sitemap Page", kh: "ផែនទីគេហទំព័រ (/sitemap)" }
      ]
    },
    {
      id: "showrooms",
      title: "Showrooms",
      titleKh: "សាខា Showroom ទូទាំងប្រទេស",
      color: "from-orange-500 to-amber-500",
      items: [
        { en: "Phnom Penh Flagship HQ", kh: "មហាវិថីសហព័ន្ធរុស្ស៊ី", badge: "BR-PP-01" },
        { en: "Siem Reap Heritage Branch", kh: "ផ្លូវជាតិលេខ ៦ (ជិតផ្សារលើ)", badge: "BR-SR-02" },
        { en: "Battambang Regional Branch", kh: "រង្វង់មូលលោកតាដំបងក្រញូង", badge: "BR-BB-03" },
        { en: "Real-Time Branch Stock", kh: "ពិនិត្យស្តុកឡានតាមសាខា" },
        { en: "Opening Hours & Contacts", kh: "ម៉ោងធ្វើការ 8AM - 7:30PM" },
        { en: "Branch Test-Drive Fleet", kh: "កងរថយន្តបើកបរសាកល្បង" }
      ]
    },
    {
      id: "ai",
      title: "AI & Support",
      titleKh: "ជំនួយការ AI & សេវាកម្ម",
      color: "from-amber-500 to-orange-600",
      items: [
        { en: "AI Sales Consultant (វិបុល)", kh: "ទីប្រឹក្សាជាន់ខ្ពស់ផ្នែកលក់", badge: "Vibol 24/7" },
        { en: "Khmer Conversational AI", kh: "យល់ភាសាខ្មែរគ្រប់បរិបទ" },
        { en: "Family Passenger Advisor", kh: "ណែនាំឡានគ្រួសារ ៥ vs ៧ នាក់" },
        { en: "Color Matching Engine", kh: "ស្គាល់ពណ៌ក្រហម, ស, ខ្មៅ..." },
        { en: "Telegram Concierge", kh: "ឆានែលពិគ្រោះយោបល់ផ្ទាល់" },
        { en: "Official XML Sitemap", kh: "ឯកសារ /sitemap.xml (SEO)" },
        { en: "Robots Crawler Policy", kh: "គោលការណ៍ /robots.txt" }
      ]
    },
    {
      id: "financing",
      title: "Financing & Order",
      titleKh: "ការបង់ប្រាក់ & បង់រំលស់",
      color: "from-orange-600 to-amber-600",
      items: [
        { en: "Bakong KHQR Checkout", kh: "ទូទាត់រហ័ស (USD & KHR)", badge: "NBC Standard" },
        { en: "Down Payment Selector", kh: "បង់មុន 10%, 20%, 30%, 50%" },
        { en: "Installment Terms", kh: "រយៈពេលបង់រហូតដល់ ៧ ឆ្នាំ" },
        { en: "Trade-In Equity Offset", kh: "កាត់ប្រាក់កក់ពីឡានចាស់" },
        { en: "Order Receipt & Tracking", kh: "បង្កាន់ដៃ និងតាមដានការកក់" },
        { en: "Admin ERP Management", kh: "ប្រព័ន្ធគ្រប់គ្រងស្តុក & ការលក់", badge: "Staff ERP" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors">
      
      {/* Top Controls Toolbar */}
      <div className="max-w-7xl xl:max-w-[1550px] mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ទៅកាន់ Showroom</span>
          </Link>
          <Link
            href="/sitemap"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Visual Directory (/sitemap)</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.1))}
              className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold"
              title="Zoom out"
            >
              -
            </button>
            <span className="px-2 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.3, prev + 0.1))}
              className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-[11px]"
            >
              Reset
            </button>
          </div>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-orange-500 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-orange-500" />
            <span>XML Sitemap</span>
          </a>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-sm shadow-orange-500/20 transition-all hover:shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Diagram Canvas */}
      <div 
        className="max-w-[1620px] mx-auto bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto transition-transform origin-top"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <div className="min-w-[1300px]">
          
          {/* Top Root Header Node (Orange Pill) */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-base sm:text-lg font-black tracking-wide shadow-lg shadow-orange-500/25 border-2 border-orange-200/40 text-center min-w-[320px]">
                <div>Information Architecture</div>
                <div className="text-xs font-medium text-orange-100">VehicleHub Automotive Platform 2026</div>
              </div>
            </div>
          </div>

          {/* Connectors SVG Trunk */}
          <div className="w-full h-12 relative -mb-2">
            <svg className="w-full h-full" viewBox="0 0 1300 48" preserveAspectRatio="none">
              {/* Vertical center stem from root */}
              <line x1="650" y1="0" x2="650" y2="24" stroke="#f97316" strokeWidth="2.5" />
              
              {/* Horizontal crossbar connecting all 6 columns */}
              <path d="M 108 24 L 1192 24" stroke="#cbd5e1" strokeWidth="2" fill="none" />
              
              {/* Center highlight stem */}
              <line x1="650" y1="24" x2="650" y2="48" stroke="#f97316" strokeWidth="2" />
              
              {/* 6 Downward drop-lines to each pillar */}
              <line x1="108" y1="24" x2="108" y2="48" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="325" y1="24" x2="325" y2="48" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="542" y1="24" x2="542" y2="48" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="758" y1="24" x2="758" y2="48" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="975" y1="24" x2="975" y2="48" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="1192" y1="24" x2="1192" y2="48" stroke="#cbd5e1" strokeWidth="2" />
            </svg>
          </div>

          {/* 6 Columns Grid */}
          <div className="grid grid-cols-6 gap-5 items-start">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="flex flex-col items-center">
                
                {/* Column Header (Orange Rounded Pill) */}
                <div className="w-full py-3 px-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-center text-sm shadow-md shadow-orange-500/15 border border-orange-200/50 mb-5 hover:translate-y-[-2px] transition-transform cursor-default">
                  <div>{pillar.title}</div>
                  <div className="text-[11px] font-medium text-orange-100">{pillar.titleKh}</div>
                </div>

                {/* Vertical Spine with Horizontal Connectors */}
                <div className="w-full pl-5 relative flex flex-col gap-3">
                  
                  {/* Spine line running vertically down */}
                  <div className="absolute left-[7px] top-[-20px] bottom-4 w-[2px] bg-slate-300 dark:bg-slate-700 rounded" />

                  {pillar.items.map((item, idx) => (
                    <div key={idx} className="relative flex items-center w-full group">
                      
                      {/* Horizontal connector line with arrow pointer */}
                      <div className="absolute -left-3.5 top-1/2 w-3.5 h-[2px] bg-slate-300 dark:bg-slate-700" />
                      <div className="absolute -left-[3px] top-[calc(50%-3px)] w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-slate-300 dark:border-l-slate-700" />

                      {/* Rounded Child Card Box (Matches reference image) */}
                      <div className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border-[1.5px] border-orange-200 dark:border-orange-500/30 hover:border-orange-500 dark:hover:border-orange-400 shadow-sm hover:shadow-md hover:bg-orange-50/40 dark:hover:bg-slate-750 transition-all text-left">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 leading-snug">
                          {item.en}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {item.kh}
                        </div>
                        {item.badge && (
                          <div className="mt-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Diagram Footer */}
          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              <strong>VehicleHub Platform Architecture</strong> • Multi-Branch Digital Inventory System
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sitemap" className="text-orange-600 dark:text-orange-400 hover:underline">
                View Full Directory
              </Link>
              <span>•</span>
              <a href="/sitemap.xml" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline">
                View XML Sitemap
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
