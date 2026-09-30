"use client";

import React from "react";
import { ADDIS_SUB_CITIES } from "@/lib/i18n/dictionaries";
import { MapPin } from "lucide-react";

interface SubCitySelectorProps {
  value: string;
  onChange: (subCity: string) => void;
  className?: string;
  allLabel?: string;
}

export default function SubCitySelector({
  value,
  onChange,
  className = "",
  allLabel = "All Sub-Cities (Addis Ababa)",
}: SubCitySelectorProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <MapPin className="w-4 h-4 text-emerald-600" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
      >
        <option value="all">{allLabel}</option>
        {ADDIS_SUB_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
