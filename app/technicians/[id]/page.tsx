"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { TechnicianProfile, Category, Review } from "@/types";
import { MOCK_TECHNICIANS, MOCK_CATEGORIES, MOCK_REVIEWS } from "@/lib/data/mock-data";
import StarRating from "@/components/StarRating";
import EscrowBadge from "@/components/EscrowBadge";
import BookingModal from "@/components/BookingModal";
import { formatETB, formatDate } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  Clock,
  PhoneCall,
  MessageSquare,
  ArrowLeft,
  Share2,
  ExternalLink,
  Award,
  Sparkles,
} from "lucide-react";

export default function TechnicianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();

  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    // Fetch single technician from API or fallback
    fetch(`/api/technicians/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTechnician(data);
        } else {
          // Fallback to local mock search
          const found = MOCK_TECHNICIANS.find(
            (item) => item.id === id || item.userId === id
          );
          if (found) {
            const reviews = MOCK_REVIEWS.filter((r) => r.technicianId === found.id);
            setTechnician({ ...found, reviewsReceived: reviews });
          }
        }
      })
      .catch(() => {
        const found = MOCK_TECHNICIANS.find(
          (item) => item.id === id || item.userId === id
        );
        if (found) {
          const reviews = MOCK_REVIEWS.filter((r) => r.technicianId === found.id);
          setTechnician({ ...found, reviewsReceived: reviews });
        }
      })
      .finally(() => setIsLoading(false));
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Technician Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">
            The requested technician profile could not be located in Addis Ababa.
          </p>
          <Link
            href="/technicians"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Back to Technicians
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryTitle = (cat: Category) => {
    if (locale === "am") return cat.nameAm;
    if (locale === "ti") return cat.nameTi;
    return cat.nameEn;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/technicians"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Technicians</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${technician.user.name} - SiraHub Addis Ababa`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Profile link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Profile info, Portfolio, Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative">
                  <img
                    src={technician.user.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"}
                    alt={technician.user.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                  />
                  {technician.isAvailable && (
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white"
                      title="Available Now"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {technician.user.name}
                    </h1>
                    {technician.user.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Pro
                      </span>
                    )}
                    {technician.isAvailable ? (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                        ● Available in Addis Ababa
                      </span>
                    ) : (
                      <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                        Currently Busy
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>
                      {technician.user.subCity} {technician.user.woreda && `• ${technician.user.woreda}`}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <StarRating
                      rating={technician.ratingAverage}
                      totalReviews={technician.totalJobs}
                      size="md"
                    />
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-600 font-semibold">
                      {technician.totalJobs} Verified Jobs Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Category tags */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {technician.categories.map((c) => (
                  <span
                    key={c.id}
                    className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-100"
                  >
                    {getCategoryTitle(c)}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <div className="mt-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">About the Technician</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {technician.bio}
                </p>
              </div>

              {/* Highlights bar */}
              <div className="mt-6 grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Experience
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {technician.yearsExperience} Years
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Starting Rate
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {formatETB(technician.hourlyRate)}/hr
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Escrow Protected
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    100% Guaranteed
                  </span>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Banner */}
            <EscrowBadge variant="banner" />

            {/* Portfolio Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t.portfolio}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Verified photos from recent trade repairs and installations in Addis Ababa.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {technician.portfolioImages && technician.portfolioImages.length > 0 ? (
                  technician.portfolioImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Portfolio sample ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        View Full Photo
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3">No portfolio images uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Past Reviews Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Client Reviews ({technician.reviewsReceived?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified feedback from real completed Escrow jobs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={technician.ratingAverage} size="sm" />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {technician.reviewsReceived && technician.reviewsReceived.length > 0 ? (
                  technician.reviewsReceived.map((rev) => (
                    <div key={rev.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                            <img
                              src={
                                rev.client?.avatarUrl ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                              }
                              alt={rev.client?.name || "Client"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {rev.client?.name || "Verified Customer"}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {rev.client?.subCity || "Addis Ababa"} • {formatDate(rev.createdAt)}
                            </span>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4">No reviews recorded yet for this pro.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Floating Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24 space-y-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Fixed Diagnostic & Starting Rate
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {formatETB(technician.hourlyRate)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ hour</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  100% held in escrow. Payout released only upon your inspection.
                </p>
              </div>

              {/* CTA Book Now */}
              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.bookNow}</span>
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </button>

              {/* Direct Call / Contact Buttons (Popular in Addis Ababa) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${technician.user.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Pro</span>
                </a>
                <a
                  href={`sms:${technician.user.phone}?body=Hello ${technician.user.name}, I found your profile on SiraHub and need a technician.`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send SMS</span>
                </a>
              </div>

              {/* Service Badges */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Instant response in {technician.user.subCity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Chapa & Telebirr verified checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>3G mobile photo compression ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full image viewer modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full preview"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <p className="text-white text-xs text-center mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          technician={technician}
          categories={categories}
        />
      )}
    </div>
  );
}
