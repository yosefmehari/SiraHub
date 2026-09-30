"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { SupportedLanguage } from "@/types";
import {
  Wrench,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Home,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/technicians", label: t.findTechnicians, icon: Wrench },
    { href: "/dashboard/client", label: t.clientDashboard, icon: Briefcase },
    { href: "/dashboard/technician", label: t.techDashboard, icon: UserCheck },
  ];

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "am", label: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", label: "ትግርኛ", flag: "🇪🇹" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Sira<span className="text-emerald-600">Hub</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Addis
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Verified Local Trades
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Language switcher, Auth button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {locale === "en" ? "EN" : locale === "am" ? "አማ" : "ትግ"}
                </span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code as SupportedLanguage);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        locale === lang.code
                          ? "font-bold text-emerald-600 bg-emerald-50/50"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Demo Login / Role switch */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Button */}
            <button
              type="button"
              onClick={() => {
                const nextLang: Record<SupportedLanguage, SupportedLanguage> = {
                  en: "am",
                  am: "ti",
                  ti: "en",
                };
                setLocale(nextLang[locale]);
              }}
              className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200"
            >
              {locale === "en" ? "EN" : locale === "am" ? "አማ" : "ትግ"}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-600" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              {t.login}
            </Link>

            <div className="flex items-center justify-around pt-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code as SupportedLanguage);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md border ${
                    locale === lang.code
                      ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
