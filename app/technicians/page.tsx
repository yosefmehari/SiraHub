"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { MOCK_CATEGORIES, MOCK_TECHNICIANS } from "@/lib/data/mock-data";
import { TechnicianProfile, Category } from "@/types";
import SubCitySelector from "@/components/SubCitySelector";
import StarRating from "@/components/StarRating";
import BookingModal from "@/components/BookingModal";
import { formatETB } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  X,
  UserCheck,
  ShieldCheck,
  Star,
  RotateCcw,
} from "lucide-react";

function TechnicianListingContent() {
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();

  const initialCat = searchParams.get("category") || "all";
  const initialSubCity = searchParams.get("subCity") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedSubCity, setSelectedSubCity] = useState(initialSubCity);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(MOCK_TECHNICIANS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [bookingTech, setBookingTech] = useState<TechnicianProfile | null>(null);

  // Sync when query params change
  useEffect(() => {
    if (searchParams.get("category")) setSelectedCategory(searchParams.get("category")!);
    if (searchParams.get("subCity")) setSelectedSubCity(searchParams.get("subCity")!);
    if (searchParams.get("search")) setSearchQuery(searchParams.get("search")!);
  }, [searchParams]);

  useEffect(() => {
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

  // Filter technicians
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      // Category filter
      if (
        selectedCategory !== "all" &&
        !tech.categories.some((c) => c.slug === selectedCategory)
      ) {
        return false;
      }

      // Sub-city filter
      if (
        selectedSubCity !== "all" &&
        tech.user.subCity.toLowerCase() !== selectedSubCity.toLowerCase()
      ) {
        return false;
      }

      // Availability filter
      if (availableOnly && !tech.isAvailable) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && tech.ratingAverage < minRating) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tech.user.name.toLowerCase().includes(q);
        const matchesBio = tech.bio?.toLowerCase().includes(q) || false;
        const matchesCat = tech.categories.some(
          (c) =>
            c.nameEn.toLowerCase().includes(q) ||
            c.nameAm.toLowerCase().includes(q) ||
            c.nameTi.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesBio && !matchesCat) return false;
      }

      return true;
    });
  }, [technicians, selectedCategory, selectedSubCity, availableOnly, minRating, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubCity("all");
    setAvailableOnly(false);
    setMinRating(0);
    setSearchQuery("");
  };

  const getCategoryTitle = (cat: Category) => {
    if (locale === "am") return cat.nameAm;
    if (locale === "ti") return cat.nameTi;
    return cat.nameEn;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Skilled Technicians in Addis Ababa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified plumbers, electricians, painters, and tradesmen backed by 100% Escrow Protection.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Trade Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {getCategoryTitle(c)} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-City Selector */}
            <div>
              <SubCitySelector
                value={selectedSubCity}
                onChange={setSelectedSubCity}
                allLabel={t.allSubCities}
              />
            </div>

            {/* Minimum Rating Selector */}
            <div>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={0}>Any Rating</option>
                <option value={4.8}>★ 4.8 & Above</option>
                <option value={4.5}>★ 4.5 & Above</option>
                <option value={4.0}>★ 4.0 & Above</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              {/* Online Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available Now Only
                </span>
              </label>

              <span className="text-xs text-slate-400">
                Showing <strong>{filteredTechnicians.length}</strong> verified technicians
              </span>
            </div>

            {(selectedCategory !== "all" ||
              selectedSubCity !== "all" ||
              availableOnly ||
              minRating > 0 ||
              searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Technician Cards Grid */}
        {filteredTechnicians.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              No technicians found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any verified technicians matching your criteria in Addis Ababa. Try resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((tech) => (
              <div
                key={tech.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={tech.user.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"}
                        alt={tech.user.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                      {tech.isAvailable ? (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                          title="Available Now"
                        />
                      ) : (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-400 border-2 border-white"
                          title="Busy"
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

                  <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>

                  {/* Categories */}
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

                  {/* Pricing & experience info */}
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

                {/* Actions */}
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
        )}
      </div>

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

export default function TechnicianListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
          Loading technicians...
        </div>
      }
    >
      <TechnicianListingContent />
    </Suspense>
  );
}
