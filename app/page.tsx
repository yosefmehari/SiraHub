"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { MOCK_CATEGORIES, MOCK_TECHNICIANS } from "@/lib/data/mock-data";
import { TechnicianProfile, Category } from "@/types";
import SubCitySelector from "@/components/SubCitySelector";
import StarRating from "@/components/StarRating";
import EscrowBadge from "@/components/EscrowBadge";
import BookingModal from "@/components/BookingModal";
import { formatETB } from "@/lib/utils";
import {
  Search,
  Wrench,
  Zap,
  Paintbrush,
  Tv,
  Cpu,
  Hammer,
  Grid,
  Flame,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
} from "lucide-react";

// Icon resolver for categories
const categoryIcons: Record<string, React.ElementType> = {
  Wrench,
  Zap,
  Paintbrush,
  Tv,
  Cpu,
  Hammer,
  Grid,
  Flame,
};

export default function HomePage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCity, setSelectedSubCity] = useState("all");
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(MOCK_TECHNICIANS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  // Booking modal state
  const [bookingTech, setBookingTech] = useState<TechnicianProfile | null>(null);

  useEffect(() => {
    // Attempt fetching live data from API
    fetch("/api/technicians")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setTechnicians(data);
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedSubCity !== "all") params.set("subCity", selectedSubCity);
    router.push(`/technicians?${params.toString()}`);
  };

  const getCategoryTitle = (cat: Category) => {
    if (locale === "am") return cat.nameAm;
    if (locale === "ti") return cat.nameTi;
    return cat.nameEn;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Addis Ababa Verified Technicians • 100% Escrow Protected</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            {t.heroTitle}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* SEARCH & FILTER BAR */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 sm:bg-transparent rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sub-City Selector */}
            <div className="w-full sm:w-56">
              <SubCitySelector
                value={selectedSubCity}
                onChange={setSelectedSubCity}
                allLabel={t.allSubCities}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>{t.findTechnicians}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Sub-City Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Popular hubs:</span>
            {["Bole", "Kazanchis", "Piassa", "Megenagna", "Kirkos"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedSubCity(city);
                  router.push(`/technicians?subCity=${encodeURIComponent(city)}`);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 100% ESCROW PROTECTION BANNER */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
                <span>{t.escrowProtected}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Chapa & Telebirr
                </span>
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5 max-w-2xl">
                {t.escrowDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block">Verified Technicians</span>
              <span className="text-[11px] text-slate-500">Addis Ababa City Kebele ID checked</span>
            </div>
            <Link
              href="/technicians"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-3.5 py-2 rounded-lg shadow-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Addis Ababa Trades
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t.featuredCategories}
            </h2>
          </div>
          <Link
            href="/technicians"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All Trades</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.iconName] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/technicians?category=${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {getCategoryTitle(cat)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cat.nameEn !== getCategoryTitle(cat) ? cat.nameEn : cat.nameAm}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOP-RATED TECHNICIANS CAROUSEL / GRID */}
      <section className="py-12 bg-slate-100/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Verified Professionals
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                {t.topRated}
              </h2>
            </div>
            <Link
              href="/technicians"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Browse All Technicians</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.slice(0, 6).map((tech) => (
              <div
                key={tech.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Card Top: Photo & Basic Details */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={tech.user.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"}
                        alt={tech.user.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                      {tech.isAvailable && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                          title="Online & Ready"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-slate-900 truncate">
                          {tech.user.name}
                        </h3>
                        {tech.user.isVerified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{tech.user.subCity}</span>
                      </div>

                      <div className="mt-1.5">
                        <StarRating
                          rating={tech.ratingAverage}
                          totalReviews={tech.totalJobs}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>

                  {/* Categories badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tech.categories.map((c) => (
                      <span
                        key={c.id}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {getCategoryTitle(c)}
                      </span>
                    ))}
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        {t.experience}
                      </span>
                      <span className="font-bold text-slate-800">
                        {tech.yearsExperience} Years
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        {t.hourlyRate}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatETB(tech.hourlyRate)}/hr
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/technicians/${tech.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    {t.viewProfile}
                  </Link>
                  <button
                    onClick={() => setBookingTech(tech)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    {t.bookNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS 3-STEP FLOW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Effortless & Safe
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How SiraHub Protects You
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The first trade marketplace in Ethiopia with 100% escrow buyer protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center mb-4">
              1
            </span>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              Book a Verified Pro
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select a plumber, electrician, or technician in your Addis Ababa sub-city. Upload an issue photo with instant client-side compression.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center mb-4">
              2
            </span>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              Escrow Holds Your ETB
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay via Chapa (CBE, Awash, Cards) or Telebirr Direct. Funds are safely held in escrow — the technician does NOT receive payment upfront.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center mb-4">
              3
            </span>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              Inspect & Release Funds
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once the job is completed to your satisfaction, click &quot;Confirm Job &amp; Release Funds&quot;. 90% payout is sent to technician, 10% platform fee deducted.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingTech && (
        <BookingModal
          isOpen={!!bookingTech}
          onClose={() => setBookingTech(null)}
          technician={bookingTech}
          categories={categories}
        />
      )}
    </div>
  );
}
