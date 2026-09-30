"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { TechnicianProfile, Category } from "@/types";
import { compressImage } from "@/lib/storage/image-compressor";
import { ADDIS_SUB_CITIES } from "@/lib/i18n/dictionaries";
import { formatETB } from "@/lib/utils";
import {
  X,
  Upload,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Sparkles,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: TechnicianProfile;
  categories: Category[];
  initialCategory?: Category;
}

export default function BookingModal({
  isOpen,
  onClose,
  technician,
  categories,
  initialCategory,
}: BookingModalProps) {
  const router = useRouter();
  const { t } = useI18n();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategory?.id || technician.categories[0]?.id || categories[0]?.id || "cat-plumbing"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subCity, setSubCity] = useState(technician.user.subCity || "Bole");
  const [woreda, setWoreda] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning (8:30 AM - 12:30 PM)");
  const [agreedPrice, setAgreedPrice] = useState<number>(technician.hourlyRate * 2);
  const [paymentGateway, setPaymentGateway] = useState<"CHAPA" | "TELEBIRR">("CHAPA");

  // Image upload and compression state
  const [isCompressing, setIsCompressing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalKB: number;
    compressedKB: number;
  } | null>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg(null);
      const result = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.75,
      });

      setPhotoPreview(result.dataUrl);
      setCompressionStats({
        originalKB: Math.round(result.originalSize / 1024),
        compressedKB: Math.round(result.compressedSize / 1024),
      });
    } catch (err) {
      console.error("Compression failed:", err);
      setErrorMsg("Failed to compress image. Please try another photo.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!title.trim() || !description.trim()) {
        setErrorMsg("Please fill in both the job title and description.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!address.trim()) {
        setErrorMsg("Please provide your specific address or landmark in Addis Ababa.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // 1. Create Job Request
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "usr-client-1", // Demo client
          technicianId: technician.userId,
          categoryId: selectedCategoryId,
          title,
          description: `${description} [Preferred: ${scheduledDate || "ASAP"} - ${timeSlot}]`,
          issuePhotoUrl: photoPreview,
          address,
          subCity,
          woreda,
          agreedPrice,
        }),
      });

      if (!jobResponse.ok) {
        throw new Error("Failed to create job request");
      }

      const jobData = await jobResponse.json();

      // 2. Initialize Escrow Payment via Chapa / Telebirr
      const paymentResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jobData.id,
          amount: agreedPrice,
          gateway: paymentGateway,
          phone: "+251911000000",
          name: "Client Customer",
        }),
      });

      const paymentData = await paymentResponse.json();

      onClose();
      // Redirect to Client Dashboard with active job highlighted
      router.push(`/dashboard/client?booked_job=${jobData.id}&escrow_held=true`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Booking process failed";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 overflow-hidden bg-slate-800">
              <img
                src={technician.user.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"}
                alt={technician.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>Book {technician.user.name}</span>
                <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded font-semibold text-white">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {technician.user.subCity} • Starting {formatETB(technician.hourlyRate)}/hr
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step >= 1 ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-800 text-[11px]">
              1
            </span>
            <span>{t.step1}</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step >= 2 ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step >= 2 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </span>
            <span>{t.step2}</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step === 3 ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 3 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
              }`}
            >
              3
            </span>
            <span>{t.step3}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Job Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {technician.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn} ({cat.nameAm})
                    </option>
                  ))}
                  {categories
                    .filter((c) => !technician.categories.some((tc) => tc.id === c.id))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameEn} ({cat.nameAm})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Issue Summary *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master bathroom water leak repair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue, symptoms, model of appliance, or specific materials needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Photo Compression & Addis Ababa Location */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Client-side Photo Compression */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Job Photo (Optional, recommended)</span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ⚡ Auto 3G Compressed
                  </span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    id="job-photo-input"
                    className="hidden"
                  />
                  <label htmlFor="job-photo-input" className="cursor-pointer block">
                    {photoPreview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={photoPreview}
                          alt="Compressed Preview"
                          className="h-32 object-cover rounded-lg border border-slate-200 mb-2 shadow-sm"
                        />
                        {compressionStats && (
                          <div className="bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
                            ✓ {compressionStats.originalKB} KB compressed down to{" "}
                            <strong>{compressionStats.compressedKB} KB</strong> (
                            {Math.round(
                              (1 - compressionStats.compressedKB / compressionStats.originalKB) *
                                100
                            )}
                            % lighter for 3G!)
                          </div>
                        )}
                        <span className="text-xs text-emerald-600 font-semibold mt-2 underline">
                          Change Photo
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        {isCompressing ? (
                          <div className="text-xs text-slate-600 font-medium">
                            Compressing image client-side...
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                            <p className="text-xs font-semibold text-slate-700">
                              Click or tap to snap / upload issue photo
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              JPEG, PNG up to 15MB. Automatically optimized for fast mobile upload.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Addis Ababa Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub-City (ክፍለ ከተማ) *
                  </label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ADDIS_SUB_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Woreda (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Woreda 03"
                    value={woreda}
                    onChange={(e) => setWoreda(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Address / Known Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Bole Medhanialem Church, Behind Morning Star Mall"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>Morning (8:30 AM - 12:30 PM)</option>
                    <option>Afternoon (1:30 PM - 5:30 PM)</option>
                    <option>Urgent / Emergency (Within 1 hour)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Agreed Price & Escrow Gateway */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-800">
                    {subCity} {woreda && `(${woreda})`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Technician:</span>
                  <span className="font-medium text-slate-800">
                    {technician.user.name} ({formatETB(technician.hourlyRate)}/hr)
                  </span>
                </div>
              </div>

              {/* Price setting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Estimated Budget (ETB)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-semibold">
                    ETB
                  </span>
                  <input
                    type="number"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    min={100}
                    step={50}
                    className="w-full pl-12 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Initial standard diagnostic/work deposit. Held safely in escrow until you approve the completion.
                </p>
              </div>

              {/* Escrow Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-emerald-900">
                    100% Escrow Protection
                  </strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Your money is NOT paid to the technician upfront. It is securely held in escrow until you confirm the job is 100% satisfactory.
                  </p>
                </div>
              </div>

              {/* Payment Gateway Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Escrow Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway("CHAPA")}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      paymentGateway === "CHAPA"
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Chapa Pay</p>
                      <p className="text-[10px] text-slate-500">
                        CBE, Awash, Cards, Telebirr
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway("TELEBIRR")}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      paymentGateway === "TELEBIRR"
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Telebirr Direct</p>
                      <p className="text-[10px] text-slate-500">
                        Direct Mobile Wallet (ETB)
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.back}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 py-2 px-3"
            >
              {t.cancel}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl shadow-sm transition-all"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitBooking}
              className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 px-5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmitting ? "Processing Escrow..." : `Pay ${formatETB(agreedPrice)} into Escrow`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
