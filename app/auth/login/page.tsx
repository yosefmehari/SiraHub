"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ADDIS_SUB_CITIES } from "@/lib/i18n/dictionaries";
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Wrench,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("+251 911 ");
  const [otpCode, setOtpCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "TECHNICIAN">("CLIENT");
  const [selectedSubCity, setSelectedSubCity] = useState("Bole");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 9) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setOtpCode("889922"); // Simulated Addis SMS OTP
    }, 700);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === "TECHNICIAN") {
        router.push("/dashboard/technician");
      } else {
        router.push("/dashboard/client");
      }
    }, 600);
  };

  const handleQuickDemoLogin = (role: "CLIENT" | "TECHNICIAN", destination: string) => {
    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-slate-900">
            Sira<span className="text-emerald-600">Hub</span>
          </span>
        </Link>
        <h2 className="text-xl font-extrabold text-slate-900">
          Phone Number Passwordless Login
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Secure OTP authentication for Addis Ababa clients &amp; technicians
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  I want to use SiraHub as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("CLIENT")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === "CLIENT"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Client (Hire Pros)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("TECHNICIAN")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === "TECHNICIAN"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <span>Technician (Pro)</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dawit Haile"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Sub-City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Primary Sub-City in Addis Ababa
                </label>
                <select
                  value={selectedSubCity}
                  onChange={(e) => setSelectedSubCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ADDIS_SUB_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ethiopian Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251 911 000000"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We will send a 6-digit SMS verification code to your phone.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? "Sending SMS..." : "Send Verification Code"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Enter 6-Digit SMS Code
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Code sent to <strong>{phoneNumber}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="889922"
                  className="w-full tracking-widest text-center py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-emerald-600 text-center font-semibold mt-1">
                  ✓ Simulated code auto-filled: 889922
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? "Verifying..." : "Verify & Enter SiraHub"}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {/* Quick Demo Instant Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block text-center mb-3">
              ⚡ Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("TECHNICIAN", "/dashboard/technician")}
                className="w-full py-2 px-3 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-emerald-800 block">
                    Abebe Kebede (Master Plumber)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Bole Atlas • View Technician Dashboard
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("CLIENT", "/dashboard/client")}
                className="w-full py-2 px-3 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-emerald-800 block">
                    Selamawit Girma (Homeowner)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Bole Medhanialem • View Client Dashboard &amp; Escrow
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
