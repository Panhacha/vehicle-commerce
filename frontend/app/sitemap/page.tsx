"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Car, 
  MapPin, 
  Search, 
  Calculator, 
  RotateCcw, 
  Sparkles, 
  FileCode, 
  ShieldCheck, 
  Phone, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  ExternalLink,
  Layers,
  Fuel,
  Zap,
  Bike,
  Wrench,
  CheckCircle2,
  Building2,
  Calendar
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANCHES } from "@/components/mockData";

export default function VisualSitemapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");

  const brands = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.brand).filter(Boolean)));

  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    const matchBrand = selectedBrand === "ALL" || prod.brand === selectedBrand;
    const matchSearch =
      !searchQuery.trim() ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.body_type && prod.body_type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchBrand && matchSearch;
  });

  const tools = [
    {
      id: "loan-calc",
      title: "Loan & Financing Calculator",
      titleKh: "ឧបករណ៍គណនាការបង់រំលស់",
      desc: "Calculate down payments, loan terms from 1 to 6 years, and monthly installments with 8.5% annual interest.",
      icon: Calculator,
      color: "bg-emerald-500 text-white",
      href: "/#loan-calculator"
    },
    {
      id: "trade-in",
      title: "Multi-Brand Trade-In Appraisal",
      titleKh: "កម្មវិធីវាយប្តូររថយន្តចាស់យកស៊េរីថ្មី",
      desc: "Get an instant market appraisal for your current car within 20 minutes to offset new car costs.",
      icon: RotateCcw,
      color: "bg-blue-500 text-white",
      href: "/#trade-in"
    },
    {
      id: "color-studio",
      title: "360° Color & Studio Configurator",
      titleKh: "ផ្ទាំងពិនិត្យមើលមួយតួខ្លួន 360° Studio",
      desc: "Inspect vehicle models from 6 dynamic camera angles, switch body paints, brake calipers, and cockpit trims.",
      icon: Layers,
      color: "bg-purple-500 text-white",
      href: "/#color-studio-360"
    },
    {
      id: "ai-vibol",
      title: "AI Sales Consultant (វិបុល / Vibol)",
      titleKh: "ទីប្រឹក្សាផ្នែកលក់ AI វិបុល 24/7",
      desc: "Instant conversational guidance on car features, family sizes (5 vs 7-seaters), budgets, and test drive bookings.",
      icon: Sparkles,
      color: "bg-amber-500 text-white",
      href: "/#ai-consultant-vibol"
    },
    {
      id: "test-drive",
      title: "Complimentary Test Drive Booking",
      titleKh: "កក់ការបើកបរសាកល្បងដោយឥតគិតថ្លៃ",
      desc: "Schedule VIP personalized test drive experience at any of our 3 showroom branches in Cambodia.",
      icon: Calendar,
      color: "bg-rose-500 text-white",
      href: "/#test-drive"
    }
  ];

  const legalLinks = [
    { name: "Privacy Policy", kh: "គោលការណ៍ឯកជនភាព", href: "/#privacy" },
    { name: "Terms of Service", kh: "លក្ខខណ្ឌប្រើប្រាស់", href: "/#terms" },
    { name: "Bakong KHQR Guidelines", kh: "សេចក្តីណែនាំទូទាត់ KHQR", href: "/#khqr" },
    { name: "Official XML Sitemap", kh: "Sitemap XML ផ្លូវការ (SEO)", href: "/sitemap.xml", isExternal: true },
    { name: "Robots Crawler Policy", kh: "Robots.txt សម្រាប់ Search Engine", href: "/robots.txt", isExternal: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Quick Action Sub-bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1620px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ទំព័រដើម Showroom</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-500 font-bold">Sitemap ផែនទីគេហទំព័រ</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sitemap-diagram"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Tree Map Diagram</span>
            </Link>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-amber-400 transition-colors shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>XML Sitemap</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Website Directory & Sitemap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ផែនទីគេហទំព័រ <span className="text-blue-600 dark:text-blue-400">VehicleHub Sitemap</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            រុករកទំព័រទាំងអស់នៃ Showroom រថយន្តស៊េរីថ្មី កាតាឡុកម៉ូឌែលទាំង ៤៤+ គ្រឿង សាខា Showroom ទាំង ៣ រាជធានី-ខេត្ត និងឧបករណ៍គណនាកម្ចី បង់រំលស់ និង 360° Studio។
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">44+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vehicle Models</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">10</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto Brands</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">3</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dealership Branches</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">SEO Ready XML</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1620px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        
        {/* Section 1: Showroom Dealership Branches */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  សាខា Showroom ទូទាំងប្រទេស (Dealership Branches)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ទីតាំង Showroom ផ្លូវការទាំង ៣ សាខាក្នុងរាជធានីភ្នំពេញ សៀមរាប និងបាត់ដំបង
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {MOCK_BRANCHES.length} Locations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                      {branch.code}
                    </span>
                    {branch.is_headquarters && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Headquarters (HQ)
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{branch.address}, {branch.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>ច័ន្ទ - អាទិត្យ (8:00 AM - 7:30 PM)</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/?branch=${encodeURIComponent(branch.code.toLowerCase())}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 transition-colors"
                >
                  <span>ពិនិត្យមើលស្តុកសាខានេះ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Automotive Services & Interactive Tools */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  ឧបករណ៍ & សេវាកម្មឌីជីថល (Interactive Tools & Services)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ប្រព័ន្ធគណនាការបង់រំលស់ វាយប្តូររថយន្តចាស់ និង 360° Studio
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {tools.length} Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {tool.title}
                        </h3>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {tool.titleKh}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <Link
                    href={tool.href}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700 transition-colors"
                  >
                    <span>បើកដំណើរការឧបករណ៍នេះ</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Vehicle Lineup Categories */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  ប្រភេទរថយន្ត (Vehicle Categories Lineup)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ស្វែងរករថយន្តតាមប្រភេទថាមពល និងកម្រិតបច្ចេកវិទ្យា
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {MOCK_CATEGORIES.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.slug)}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {cat.description}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Section 4: All 44+ Vehicle Models Directory */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  កាតាឡុកម៉ូឌែលរថយន្តទាំងអស់ (All Vehicle Inventory Directory)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  តារាងឈ្មោះ និងតម្លៃរថយន្តទាំងអស់ក្នុងស្តុកប្រចាំ Showroom
                </p>
              </div>
            </div>

            {/* Brand Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedBrand("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedBrand === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                All Brands ({MOCK_PRODUCTS.length})
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                    selectedBrand === b
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search in Directory */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ម៉ូឌែល ឬតម្លៃ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/?model=${encodeURIComponent((prod.model || prod.name).toLowerCase().replace(/\s+/g, "-"))}&id=${prod.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {prod.brand}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {prod.year} • {prod.body_type}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                    {prod.name} {prod.model !== prod.name ? prod.model : ""}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    {prod.top_label && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {prod.top_label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ${prod.base_price.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>មើលព័ត៌មាន</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              មិនមានម៉ូឌែលត្រូវនឹងការស្វែងរក &quot;{searchQuery}&quot; ឡើយ។
            </div>
          )}
        </section>

        {/* Section 5: Legal & Search Engine Policies */}
        <section className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              គោលការណ៍ច្បាប់ និងឯកសារបច្ចេកទេស (Legal & Crawler Policies)
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ទំព័រ និងតំណភ្ជាប់ខាងក្រោមត្រូវបានរៀបចំឡើងស្របតាមស្តង់ដារអន្តរជាតិ W3C, Google Search Central និង Bing Webmaster ដើម្បីធានាបាននូវការស្វែងរក និង Indexing កម្រិតខ្ពស់បំផុត៖
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
              >
                <span>{link.name}</span>
                <span className="text-[11px] text-slate-400">({link.kh})</span>
                {link.isExternal && <ExternalLink className="w-3 h-3 text-slate-400" />}
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          © 2026 VehicleHub Automotive Platform. Official Digital Sitemap & Multi-Branch Directory.
        </div>
      </footer>
    </div>
  );
}
