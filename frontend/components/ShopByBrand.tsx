"use client";

import React from "react";
import { ArrowRight, Users, Briefcase, Car, Sparkles } from "lucide-react";

export const BrandEmblem: React.FC<{ brandId: string; className?: string }> = ({ className = "h-7 w-auto" }) => {
  return <Car className={className} />;
};

interface RideCategory {
  id: string;
  name: string;
  seats: string;
  bags: string;
  startingPrice: string;
  image: string;
  targetCategorySlug: string;
  targetBrand?: string;
}

const RIDE_CATEGORIES: RideCategory[] = [
  {
    id: "economy",
    name: "Economy & Compact",
    seats: "5 Seats",
    bags: "2 Bags",
    startingPrice: "$23,125",
    image: "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/corolla/base.png?fmt=png-alpha&wid=600",
    targetCategorySlug: "gasoline-vehicles",
  },
  {
    id: "sedans",
    name: "Sedans & Hybrids",
    seats: "5 Seats",
    bags: "3 Bags",
    startingPrice: "$29,600",
    image: "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/camry/base.png?fmt=png-alpha&wid=600",
    targetCategorySlug: "electric-vehicles",
  },
  {
    id: "suvs",
    name: "SUVs & Off-Road",
    seats: "7 Seats",
    bags: "4 Bags",
    startingPrice: "$42,270",
    image: "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/4runner/base.png?fmt=png-alpha&wid=600",
    targetCategorySlug: "gasoline-vehicles",
  },
  {
    id: "luxury",
    name: "Luxury VIP & Sports",
    seats: "4-5 Seats",
    bags: "3 Bags",
    startingPrice: "$58,300",
    image: "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grsupra/base.png?fmt=png-alpha&wid=600",
    targetCategorySlug: "all",
  },
  {
    id: "vans",
    name: "Vans & Pickups",
    seats: "8 Seats",
    bags: "6 Bags",
    startingPrice: "$32,545",
    image: "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/tacoma/base.png?fmt=png-alpha&wid=600",
    targetCategorySlug: "gasoline-vehicles",
  },
];

interface ShopByBrandProps {
  selectedBrand?: string;
  onSelectBrand?: (brandName: string) => void;
  brandCounts?: Record<string, number>;
  onSelectCategory?: (categorySlug: string) => void;
  onScrollToShowroom?: () => void;
  onOpenLoanModal?: () => void;
}

export const ShopByBrand: React.FC<ShopByBrandProps> = ({
  onSelectCategory,
  onScrollToShowroom,
  onOpenLoanModal,
}) => {
  const handleCategoryClick = (slug: string) => {
    onSelectCategory?.(slug);
    onScrollToShowroom?.();
  };

  return (
    <section id="choose-your-ride" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24">
      
      {/* 1. CHOOSE YOUR RIDE Header */}
      <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            CHOOSE YOUR RIDE
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Find the perfect vehicle for your next journey in Cambodia
          </p>
        </div>

        <button
          onClick={onScrollToShowroom}
          className="text-xs sm:text-sm font-bold text-slate-700 hover:text-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer group shrink-0"
        >
          <span>View All Cars</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 2. Category Cards Grid (Matching DriveX 5-Column Carousel) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {RIDE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.targetCategorySlug)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-4 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
          >
            {/* Vehicle Image */}
            <div className="h-32 sm:h-36 flex items-center justify-center p-2 mb-2">
              <img
                src={cat.image}
                alt={cat.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                {cat.name}
              </h3>

              {/* Specs icons (Seats & Bags) */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cat.seats}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cat.bags}</span>
                </span>
              </div>

              {/* Pricing line */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-baseline justify-between text-xs">
                <span className="text-slate-400 text-[11px]">From</span>
                <span className="text-sm font-black text-amber-500">
                  {cat.startingPrice} <span className="text-[10px] text-slate-400 font-normal">/ cash</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Promotional Banners (Two Split Cards matching DriveX screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 sm:mt-10">
        
        {/* Left Card: Special Offer 20% OFF (Dark Card) */}
        <div className="bg-[#111827] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10 max-w-xs space-y-2">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Special Campaign • យុទ្ធនាការពិសេស
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Get <span className="text-amber-400">20% OFF</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Down payment subsidy on all 2026 Toyota models and hybrid vehicles this month.
            </p>
            <div className="pt-3">
              <button
                onClick={onScrollToShowroom}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
              >
                Book Now (កក់ភ្លាមៗ)
              </button>
            </div>
          </div>

          {/* Yellow Sports Car on right */}
          <div className="absolute right-[-20px] bottom-0 w-56 sm:w-72 pointer-events-none opacity-90">
            <img
              src="https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grsupra/base.png?fmt=png-alpha&wid=600"
              alt="Toyota Sports Car"
              className="w-full h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right Card: Long Term Rentals / Installments (Light Gradient Card) */}
        <div className="bg-gradient-to-r from-slate-100 via-slate-100 to-amber-50/40 rounded-3xl p-6 sm:p-8 text-slate-900 border border-slate-200/90 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="relative z-10 max-w-xs space-y-2">
            <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              Financing & Installment • បង់រំលោះ
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Save Up to <span className="text-amber-500">30%</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Low 7.5% annual interest rates with flexible payback terms up to 72 months without collateral.
            </p>
            <div className="pt-3">
              <button
                onClick={onOpenLoanModal}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
              >
                Learn More (គណនាប្រាក់កម្ចី)
              </button>
            </div>
          </div>

          {/* Driver image on right */}
          <div className="absolute right-0 bottom-0 top-0 w-44 sm:w-56 pointer-events-none opacity-85 hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
              alt="Happy customer driving vehicle"
              className="w-full h-full object-cover object-center rounded-r-3xl"
            />
          </div>
        </div>

      </div>

    </section>
  );
};
