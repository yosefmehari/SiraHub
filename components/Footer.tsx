"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ADDIS_SUB_CITIES } from "@/lib/i18n/dictionaries";
import { ShieldCheck, PhoneCall, Heart, Wrench, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Escrow Guarantee Top Banner */}
      <div className="bg-emerald-950/70 border-b border-emerald-900/50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                100% Escrow Protection (Chapa & Telebirr)
              </p>
              <p className="text-slate-400 text-xs">
                Funds are released to technician only when you approve the job quality.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Advance Risk</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                Sira<span className="text-emerald-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              On-Demand Local Trades Marketplace connecting homes and businesses with verified plumbers, electricians, painters, and technicians in Addis Ababa.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Customer Care: +251 911 000 000 (Addis Ababa)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/technicians?category=plumbing" className="hover:text-emerald-400 transition-colors">
                  Plumbing (የቧንቧ ስራ)
                </Link>
              </li>
              <li>
                <Link href="/technicians?category=electrical" className="hover:text-emerald-400 transition-colors">
                  Electrical (የኤሌክትሪክ ስራ)
                </Link>
              </li>
              <li>
                <Link href="/technicians?category=painting" className="hover:text-emerald-400 transition-colors">
                  Painting (የቀለም ቅብ)
                </Link>
              </li>
              <li>
                <Link href="/technicians?category=dstv-satellite" className="hover:text-emerald-400 transition-colors">
                  DSTV Installation (የዲኤስቲቪ ገጠማ)
                </Link>
              </li>
              <li>
                <Link href="/technicians?category=appliance-repair" className="hover:text-emerald-400 transition-colors">
                  Appliance Repair (የቤት እቃዎች ጥገና)
                </Link>
              </li>
            </ul>
          </div>

          {/* Addis Ababa Sub-Cities */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Addis Ababa Coverage
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-400">
              {ADDIS_SUB_CITIES.map((subCity) => (
                <Link
                  key={subCity}
                  href={`/technicians?subCity=${encodeURIComponent(subCity)}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  • {subCity}
                </Link>
              ))}
            </div>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Integrated Gateways
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-xs font-semibold text-white">Chapa Payment Gateway</p>
                <p className="text-[11px] text-slate-400">
                  CBE Birr, Awash, Bank Cards & Telebirr
                </p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-xs font-semibold text-white">Telebirr Direct Payout</p>
                <p className="text-[11px] text-slate-400">
                  Instant escrow payout directly to technician mobile wallet
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SiraHub Ethiopia. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for Addis Ababa artisans & homeowners</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
