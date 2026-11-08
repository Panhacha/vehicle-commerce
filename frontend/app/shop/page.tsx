"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car,
  Fuel,
  Gauge,
  Users,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Check,
  Filter,
  RotateCcw,
  X,
  ChevronRight,
  Eye,
  Building2,
  ChevronDown,
  Loader2,
  ShoppingCart,
  Plus
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANCHES } from "@/components/mockData";
import { Product, Branch } from "@/components/types";
import { useCart } from "@/components/CartContext";
import { LoanCalculatorModal } from "@/components/LoanCalculatorModal";
import { TradeInModal } from "@/components/TradeInModal";
import { CategoryBrandCarousel } from "@/components/CategoryBrandCarousel";
import { useCustomerAuth } from "@/components/CustomerAuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

// Body Types & Categories (ភេទនៃឡាន & ប្រភេទផលិតផល)
const BODY_TYPE_FILTERS = [
  { id: "all", label: "ទាំងអស់ (All Products)", icon: "🚗" },
  { id: "suv", label: "SUV & Crossover", icon: "🚙" },
  { id: "sedan", label: "Sedan & Sport", icon: "🏎️" },
  { id: "truck", label: "Truck & Pickup", icon: "🛻" },
  { id: "ev", label: "Electric & Hybrid", icon: "⚡" },
  { id: "minivan", label: "Minivan & Family", icon: "🚐" },
  { id: "ebike", label: "កង់អគ្គិសនី (E-Bikes)", icon: "🚲" },
  { id: "parts", label: "គ្រឿងបន្លាស់ (Spare Parts)", icon: "🔧" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, cart, totalItemCount } = useCart();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();

  const handleBookCar = (carId: string, carName: string) => {
    if (!isLoggedIn) {
      openAuthModal(() => {
        router.push(`/checkout?id=${carId}`);
      }, `សូមចូលគណនី ឬចុះឈ្មោះជាមុនសិន ដើម្បីធ្វើការកក់រថយន្ត ${carName}!`);
    } else {
      router.push(`/checkout?id=${carId}`);
    }
  };

  // Add to Cart Animation & Feedback states
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [toastProduct, setToastProduct] = useState<Product | null>(null);

  // Auto-dismiss Toast
  useEffect(() => {
    if (!toastProduct) return;
    const timer = setTimeout(() => {
      setToastProduct(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastProduct]);

  const handleAddToCart = (e: React.MouseEvent, car: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(car, { color: car.colors?.[0]?.name || "Standard", trim: "Standard Edition" }, 1);

    setJustAddedId(car.id);
    setToastProduct(car);

    setTimeout(() => {
      setJustAddedId((prev) => (prev === car.id ? null : prev));
    }, 2200);
  };

  const initialCat = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const [selectedBodyType, setSelectedBodyType] = useState<string>(initialCat);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedBodyType(cat);
    const br = searchParams.get("brand");
    if (br) setSelectedBrand(br);
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "year-desc">("featured");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(MOCK_BRANCHES[0]?.id || "");

  // Live Database Products State
  const [productsList, setProductsList] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLiveDbConnected, setIsLiveDbConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch Live Products from Supabase DB via Go Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const liveMerged: Product[] = json.data.map((liveProd: any) => {
              const mockMatch = MOCK_PRODUCTS.find(
                (m) =>
                  m.sku === liveProd.sku ||
                  m.id === liveProd.id ||
                  m.model?.toLowerCase() === liveProd.model?.toLowerCase()
              );

              let parsedImages: string[] = ["/angles/suv_34.jpg"];
              if (Array.isArray(liveProd.images) && liveProd.images.length > 0) {
                parsedImages = liveProd.images;
              } else if (typeof liveProd.images === "string") {
                try {
                  const arr = JSON.parse(liveProd.images);
                  if (Array.isArray(arr) && arr.length > 0) parsedImages = arr;
                } catch (e) {}
              } else if (mockMatch?.images && mockMatch.images.length > 0) {
                parsedImages = mockMatch.images;
              }

              let parsedSpecs: Record<string, any> = {};
              if (liveProd.specs && typeof liveProd.specs === "object") {
                parsedSpecs = liveProd.specs;
              } else if (typeof liveProd.specs === "string") {
                try {
                  parsedSpecs = JSON.parse(liveProd.specs);
                } catch (e) {}
              } else if (mockMatch?.specs) {
                parsedSpecs = mockMatch.specs;
              }

              const bodyType =
                liveProd.body_type ||
                mockMatch?.body_type ||
                (liveProd.name?.toLowerCase().includes("tacoma") || liveProd.name?.toLowerCase().includes("tundra")
                  ? "Truck"
                  : liveProd.name?.toLowerCase().includes("camry") ||
                    liveProd.name?.toLowerCase().includes("corolla") ||
                    liveProd.name?.toLowerCase().includes("prius")
                  ? "Sedan"
                  : liveProd.name?.toLowerCase().includes("sienna")
                  ? "Minivan"
                  : "SUV");

              return {
                ...mockMatch,
                id: liveProd.id || mockMatch?.id || `prod-${Math.random()}`,
                category_id: liveProd.category_id || mockMatch?.category_id || "",
                category_name: liveProd.category_name || mockMatch?.category_name,
                category_type: liveProd.category_type || mockMatch?.category_type,
                sku: liveProd.sku || mockMatch?.sku || "",
                name: liveProd.name || mockMatch?.name || "Vehicle",
                brand: liveProd.brand || mockMatch?.brand || "Toyota",
                model: liveProd.model || mockMatch?.model || "",
                year: liveProd.year || mockMatch?.year || 2026,
                base_price: Number(liveProd.base_price) || mockMatch?.base_price || 35000,
                as_shown_price: liveProd.as_shown_price || mockMatch?.as_shown_price,
                condition: liveProd.condition || mockMatch?.condition || "NEW",
                description: liveProd.description || mockMatch?.description || "",
                images: parsedImages,
                specs: parsedSpecs,
                is_active: liveProd.is_active ?? true,
                body_type: bodyType,
                mpg_range: liveProd.mpg_range || mockMatch?.mpg_range || parsedSpecs?.MPG || "24/30 MPG",
                seating: liveProd.seating || mockMatch?.seating || parsedSpecs?.Seating || 5,
                colors: mockMatch?.colors || [],
                top_label: liveProd.top_label || mockMatch?.top_label || parsedSpecs?.TopLabel || "Official Model",
              };
            });

            if (isMounted) {
              setProductsList(liveMerged);
              setIsLiveDbConnected(true);
            }
          }
        }
      } catch (err) {
        console.warn("Using offline catalog fallback for products:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Modal States
  const [loanProduct, setLoanProduct] = useState<Product | null>(null);
  const [isLoanOpen, setIsLoanOpen] = useState(false);

  const [tradeInProduct, setTradeInProduct] = useState<Product | null>(null);
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);

  // Available Brands list from live products
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [productsList]);

  // Filtered & Sorted Products from live products
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((prod) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesModel = prod.model.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesBody = (prod.body_type || "").toLowerCase().includes(q);
        if (!matchesName && !matchesModel && !matchesBrand && !matchesBody) {
          return false;
        }
      }

      // 2. Brand filter
      if (selectedBrand !== "all" && prod.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // 3. Body Type / Category filter (ភេទនៃឡាន & ផលិតផល)
      if (selectedBodyType !== "all") {
        const body = (prod.body_type || "").toLowerCase();
        const catType = (prod.category_type || "").toLowerCase();
        const topLabel = (prod.top_label || "").toLowerCase();
        const name = prod.name.toLowerCase();

        if (selectedBodyType === "suv") {
          return body.includes("suv") || body.includes("crossover");
        }
        if (selectedBodyType === "sedan") {
          return body.includes("sedan") || body.includes("sport") || name.includes("camry") || name.includes("corolla") || name.includes("supra") || name.includes("crown");
        }
        if (selectedBodyType === "truck") {
          return body.includes("truck") || name.includes("tacoma") || name.includes("tundra");
        }
        if (selectedBodyType === "ev") {
          return (
            catType.includes("electric") ||
            topLabel.includes("hybrid") ||
            topLabel.includes("ev") ||
            name.includes("bz4x") ||
            name.includes("prius") ||
            name.includes("seal")
          );
        }
        if (selectedBodyType === "minivan") {
          return body.includes("van") || body.includes("minivan") || name.includes("sienna");
        }
        if (selectedBodyType === "ebike") {
          return (
            body.includes("bicycle") ||
            body.includes("bike") ||
            catType.includes("bicycle") ||
            name.includes("bike") ||
            name.includes("super73") ||
            name.includes("specialized") ||
            name.includes("vado")
          );
        }
        if (selectedBodyType === "parts") {
          return (
            body.includes("part") ||
            catType.includes("spare_part") ||
            name.includes("part") ||
            name.includes("brake") ||
            name.includes("brembo") ||
            name.includes("ceramic") ||
            name.includes("kit")
          );
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === "year-desc") {
      list = [...list].sort((a, b) => b.year - a.year);
    }

    return list;
  }, [searchQuery, selectedBrand, selectedBodyType, sortBy]);

  // Selected Branch Object
  const currentBranch = useMemo(() => {
    return MOCK_BRANCHES.find((b) => b.id === selectedBranchId) || MOCK_BRANCHES[0];
  }, [selectedBranchId]);

  const handleOpenLoan = (prod: Product) => {
    setLoanProduct(prod);
    setIsLoanOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedBodyType("all");
    setSelectedBrand("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors">
      
      {/* 1. BRAND & CATEGORY CARD SLIDER (Scrolls naturally and hides on scroll) */}
      <section className="bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#090d16] text-white py-5 sm:py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryBrandCarousel
            selectedCategory={selectedBodyType}
            onSelectCategory={(id) => setSelectedBodyType(id)}
            selectedBrand={selectedBrand}
            onSelectBrand={(brand) => setSelectedBrand(brand)}
            products={productsList}
            darkVariant={true}
          />
        </div>
      </section>

      {/* 3. SEARCH & CONTROLS TOOLBAR */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬម៉ូឌែល (ឧ. Camry, 4Runner, Tacoma...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns (Brand, Sort) */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              
              {/* Brand Filter */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                >
                  <option value="all">គ្រប់ម៉ាក (All Brands)</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                >
                  <option value="featured">លំដាប់លំនាំដើម (Featured)</option>
                  <option value="price-asc">តម្លៃ៖ ទាប → ខ្ពស់</option>
                  <option value="price-desc">តម្លៃ៖ ខ្ពស់ → ទាប</option>
                  <option value="year-desc">ឆ្នាំផលិត៖ ថ្មីបំផុត</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Reset button if filtered */}
              {(selectedBodyType !== "all" || selectedBrand !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* 4. MAIN VEHICLES GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            បង្ហាញចំនួន <strong className="text-slate-900 dark:text-white font-mono text-base">{filteredProducts.length}</strong> រថយន្តក្នុងស្តុក
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ស្តុកមានស្រាប់ ដឹកជូនទូទាំងប្រទេស</span>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">មិនមានរថយន្តត្រូវនឹងលក្ខខណ្ឌស្វែងរក</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">សូមសាកល្បងប្តូរពាក្យគន្លឹះ ឬជ្រើសរើសប្រភេទផ្សេង</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-500 transition-colors cursor-pointer"
            >
              សម្អាតតម្រងទាំងអស់ (Reset Filters)
            </button>
          </div>
        )}

        {/* Vehicle Grid: Clean, Compact & Direct */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((car) => {
            const monthlyEst = Math.round((car.base_price * 0.7 * 0.085) / 12);
            const isPartOrBike = car.category_type === "SPARE_PART" || car.body_type === "Parts" || car.category_type === "BICYCLE" || car.body_type === "Bicycle";
            const inCartQty = cart.items
              .filter((it) => it.product_id === car.id)
              .reduce((sum, it) => sum + it.quantity, 0);
            const isJustAdded = justAddedId === car.id;

            return (
              <div
                key={car.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
                  isJustAdded
                    ? "border-emerald-500 shadow-xl shadow-emerald-500/10"
                    : inCartQty > 0
                    ? "border-emerald-500/50 shadow-xs hover:shadow-lg hover:border-emerald-500"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400/80 shadow-xs hover:shadow-xl"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {car.brand} • {car.year}
                      </span>
                      {inCartQty > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>ក្នុងកន្ត្រក ({inCartQty})</span>
                        </span>
                      )}
                      {car.top_label && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          car.top_label.includes("Hybrid") || car.top_label.includes("EV")
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}>
                          {car.top_label}
                        </span>
                      )}
                    </div>

                    <span className="text-[10.5px] font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
                      {car.body_type || "SUV"}
                    </span>
                  </div>

                  {/* Clean Showcase Stage - Click navigates to checkout */}
                  <Link
                    href={`/checkout?id=${car.id}`}
                    className="relative rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-200/40 dark:from-slate-800/40 dark:via-slate-900/60 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800/70 p-3 flex items-center justify-center h-40 sm:h-44 overflow-hidden group/img cursor-pointer block"
                  >
                    <img
                      src={car.images?.[0] || "/angles/suv_34.jpg"}
                      alt={car.name}
                      className="max-h-32 sm:max-h-36 w-full object-contain filter drop-shadow-md group-hover/img:scale-108 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.src = "/angles/suv_34.jpg";
                      }}
                    />
                  </Link>

                  {/* Car Identity */}
                  <div className="mt-3.5">
                    <Link
                      href={`/checkout?id=${car.id}`}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-amber-500 transition-colors leading-snug truncate block"
                    >
                      {car.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {car.model || car.brand} • {isPartOrBike ? "គ្រឿងបន្លាស់ផ្លូវការ" : "រថយន្តផ្លូវការ"}
                    </p>
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {isPartOrBike ? "តម្លៃគ្រឿងបន្លាស់" : "តម្លៃយានយន្ត"}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                        ${car.base_price.toLocaleString()} <span className="text-xs font-bold text-slate-400">USD</span>
                      </div>
                    </div>

                    {!isPartOrBike && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenLoan(car)}
                          className="text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md hover:underline cursor-pointer"
                        >
                          ~${monthlyEst}/ខែ (រំលស់)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clean Buttons: Quick Cart with Live Animation + Book Now */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {/* Floating "+1 ចូលកន្ត្រក!" Pop Bubble */}
                      {isJustAdded && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-lg shadow-emerald-500/40 whitespace-nowrap pointer-events-none animate-bounce flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>+1 ចូលកន្ត្រក!</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, car)}
                        title={
                          inCartQty > 0
                            ? `ក្នុងកន្ត្រកមាន ${inCartQty} គ្រឿង (ចុចដើម្បីបន្ថែម)`
                            : "ដាក់ចូលកន្ត្រកទំនិញ"
                        }
                        className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer relative ${
                          isJustAdded
                            ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                            : inCartQty > 0
                            ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95"
                            : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:border-amber-400 hover:text-slate-950 text-slate-700 dark:text-slate-200 active:scale-95"
                        }`}
                      >
                        {isJustAdded ? (
                          <Check className="w-4 h-4 text-white stroke-[2.5] animate-in zoom-in duration-200" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 transition-transform active:scale-125" />
                        )}

                        {/* Cart Quantity Badge (Permanent indicator so user knows it's added) */}
                        {inCartQty > 0 && !isJustAdded && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 animate-in zoom-in">
                            {inCartQty}
                          </span>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookCar(car.id, car.name)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer group/btn"
                    >
                      <span>{isPartOrBike ? "ទិញភ្លាមៗ" : "កក់ឡាននេះ"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Attractive Floating Toast Notification when item added to cart */}
      {toastProduct && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-950/95 dark:bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-2xl border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 p-1 shrink-0 border border-slate-700 flex items-center justify-center overflow-hidden">
            <img
              src={toastProduct.images?.[0] || "/angles/suv_34.jpg"}
              alt={toastProduct.name}
              className="w-full h-full object-contain"
              onError={(e: any) => {
                e.target.src = "/angles/suv_34.jpg";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>បានដាក់ចូលកន្ត្រកជោគជ័យ!</span>
            </div>
            <div className="text-xs font-bold text-white truncate mt-0.5">
              {toastProduct.name}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ${toastProduct.base_price.toLocaleString()} USD
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/checkout?mode=cart"
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center gap-1 transition-all shadow-md shadow-emerald-500/25 cursor-pointer whitespace-nowrap"
            >
              <span>កន្ត្រក ({totalItemCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setToastProduct(null)}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loan Calculator Modal */}
      <LoanCalculatorModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
        initialProduct={loanProduct}
        branches={MOCK_BRANCHES}
      />

      {/* Trade-in Modal */}
      <TradeInModal
        isOpen={isTradeInOpen}
        onClose={() => setIsTradeInOpen(false)}
        targetProduct={tradeInProduct}
        products={MOCK_PRODUCTS}
        branches={MOCK_BRANCHES}
      />

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

