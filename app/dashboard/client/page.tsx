"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { JobRequest, PaymentStatus, JobStatus } from "@/types";
import { MOCK_JOBS } from "@/lib/data/mock-data";
import StarRating from "@/components/StarRating";
import EscrowBadge from "@/components/EscrowBadge";
import { formatETB, formatDate } from "@/lib/utils";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Star,
  MapPin,
  ExternalLink,
  Smartphone,
  PhoneCall,
  X,
  FileCheck,
  Check,
} from "lucide-react";

function ClientDashboardContent() {
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [jobs, setJobs] = useState<JobRequest[]>(MOCK_JOBS);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Review modal state
  const [reviewJob, setReviewJob] = useState<JobRequest | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Escrow release confirmation modal
  const [releaseModalJob, setReleaseModalJob] = useState<JobRequest | null>(null);
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false);
  const [releasedReceipt, setReleasedReceipt] = useState<{
    totalAmount: number;
    commissionFee: number;
    technicianPayout: number;
    transferRef: string;
    technicianName: string;
  } | null>(null);

  // Load jobs from API
  const fetchClientJobs = () => {
    fetch("/api/jobs?clientId=usr-client-1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setJobs(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchClientJobs();

    // Check if redirected after payment
    if (searchParams.get("payment_success") || searchParams.get("escrow_held")) {
      setActionSuccessMsg("Payment successfully placed into Escrow! Technician has been notified.");
      setTimeout(() => setActionSuccessMsg(null), 6000);
    }
  }, [searchParams]);

  // Initiate Escrow payment for an unpaid job
  const handlePayIntoEscrow = async (job: JobRequest, gateway: "CHAPA" | "TELEBIRR") => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          amount: job.agreedPrice,
          gateway,
          phone: job.client?.phone || "+251911000000",
          name: job.client?.name || "Client",
        }),
      });

      if (res.ok) {
        setActionSuccessMsg(`ETB ${job.agreedPrice} successfully deposited into Escrow via ${gateway}!`);
        fetchClientJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Job & Release Funds
  const handleConfirmAndRelease = async () => {
    if (!releaseModalJob) return;

    try {
      setIsReleasingEscrow(true);
      const res = await fetch("/api/payments/release-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: releaseModalJob.id,
          payoutMethod: "TELEBIRR",
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setReleasedReceipt({
          totalAmount: data.data.payoutSummary.totalAmount,
          commissionFee: data.data.payoutSummary.commissionFee,
          technicianPayout: data.data.payoutSummary.technicianPayout,
          transferRef: data.data.payoutSummary.transferRef,
          technicianName: releaseModalJob.technician?.name || "Technician",
        });

        // Prompt user to review
        setReviewJob(releaseModalJob);
        setReleaseModalJob(null);
        fetchClientJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReleasingEscrow(false);
    }
  };

  // Submit Star Review
  const handleSubmitReview = async () => {
    if (!reviewJob) return;

    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/jobs/${reviewJob.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingVal,
          comment: reviewComment,
          clientId: "usr-client-1",
          technicianId: reviewJob.techProfile?.id || reviewJob.technicianId,
        }),
      });

      if (res.ok) {
        setReviewJob(null);
        setReviewComment("");
        setActionSuccessMsg("Thank you! Your verified rating and review has been published.");
        fetchClientJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const activeJobs = jobs.filter((j) => j.status !== "COMPLETED" || j.paymentStatus === "HELD_IN_ESCROW");
  const completedJobs = jobs.filter((j) => j.status === "COMPLETED" && j.paymentStatus === "RELEASED");

  const displayedJobs = activeTab === "active" ? activeJobs : completedJobs;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {t.clientDashboard}
              </h1>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Verified Client
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your trades requests, manage escrow deposits, and release payouts.
            </p>
          </div>

          <Link
            href="/technicians"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            + Book Another Technician
          </Link>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Released Receipt Banner Modal */}
        {releasedReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-center font-bold text-lg text-slate-900">
                Funds Successfully Released!
              </h3>
              <p className="text-center text-xs text-slate-500 mt-1 mb-4">
                Telebirr Payout sent directly to {releasedReceipt.technicianName}.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Escrow Amount:</span>
                  <span className="font-bold text-slate-800">
                    {formatETB(releasedReceipt.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee (10%):</span>
                  <span>- {formatETB(releasedReceipt.commissionFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 pt-2 border-t border-slate-200">
                  <span>Technician Payout (90% via Telebirr):</span>
                  <span>{formatETB(releasedReceipt.technicianPayout)}</span>
                </div>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Ref: {releasedReceipt.transferRef}
                </div>
              </div>

              <button
                onClick={() => setReleasedReceipt(null)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Active &amp; In-Progress Jobs</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
              {activeJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "completed"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Completed &amp; Released</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
              {completedJobs.length}
            </span>
          </button>
        </div>

        {/* Jobs List */}
        {displayedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800">
              No {activeTab} jobs right now
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Need a plumber or electrician in Addis Ababa? Choose a verified pro.
            </p>
            <Link
              href="/technicians"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Browse Technicians
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map((job) => {
              const isAwaitingRelease =
                job.status === "COMPLETED" && job.paymentStatus === "HELD_IN_ESCROW";
              const isUnpaid = job.paymentStatus === "UNPAID";

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                    isAwaitingRelease
                      ? "border-amber-400/80 ring-2 ring-amber-400/20 bg-amber-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md">
                          {job.category?.nameEn || "Trade Service"}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">
                          {job.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Booked on {formatDate(job.createdAt)} • Ref: {job.id}
                      </p>
                    </div>

                    {/* Status & Escrow Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Job Status */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : job.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {job.status === "COMPLETED"
                          ? "✓ Completed"
                          : job.status === "IN_PROGRESS"
                          ? "● In Progress"
                          : "⏳ Pending Pro"}
                      </span>

                      {/* Payment Status */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          job.paymentStatus === "RELEASED"
                            ? "bg-slate-100 text-slate-700"
                            : job.paymentStatus === "HELD_IN_ESCROW"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {job.paymentStatus === "RELEASED"
                          ? "Escrow Released"
                          : job.paymentStatus === "HELD_IN_ESCROW"
                          ? "Held in Escrow"
                          : "Unpaid"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Description & Address */}
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-slate-600 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          {job.subCity} {job.woreda && `(${job.woreda})`} • {job.address}
                        </span>
                      </div>
                      {job.issuePhotoUrl && (
                        <div className="pt-1">
                          <img
                            src={job.issuePhotoUrl}
                            alt="Issue photo"
                            className="h-20 w-32 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Technician Contact & Price Breakdown */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Technician:</span>
                        <span className="font-bold text-slate-900">
                          {job.technician?.name || "Assigned Pro"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Agreed Price:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {formatETB(job.agreedPrice)}
                        </span>
                      </div>
                      {job.transaction && (
                        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          Gateway: <strong>{job.transaction.paymentGateway}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      {isAwaitingRelease && (
                        <span className="text-amber-800 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Technician marked job completed. Please inspect and confirm release!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* UNPAID: Pay into Escrow */}
                      {isUnpaid && (
                        <>
                          <button
                            onClick={() => handlePayIntoEscrow(job, "CHAPA")}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay {formatETB(job.agreedPrice)} (Chapa)</span>
                          </button>
                          <button
                            onClick={() => handlePayIntoEscrow(job, "TELEBIRR")}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Telebirr</span>
                          </button>
                        </>
                      )}

                      {/* COMPLETED & HELD IN ESCROW: The Core Requirement */}
                      {isAwaitingRelease && (
                        <button
                          onClick={() => setReleaseModalJob(job)}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 animate-pulse"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.confirmJobReleaseFunds}</span>
                        </button>
                      )}

                      {/* RELEASED: Allow rating/review if not yet reviewed */}
                      {job.paymentStatus === "RELEASED" && (
                        <button
                          onClick={() => setReviewJob(job)}
                          className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>{job.review ? "Update Review" : "Leave Review"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM JOB & RELEASE ESCROW MODAL */}
      {releaseModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Confirm Job &amp; Release Funds
                  </h3>
                  <p className="text-xs text-slate-500">
                    Job: {releaseModalJob.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReleaseModalJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                By confirming, you certify that the technician has successfully delivered the requested work to your satisfaction in Addis Ababa.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Escrow Amount:</span>
                  <span className="font-bold text-slate-800">
                    {formatETB(releaseModalJob.agreedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee (10%):</span>
                  <span>- {formatETB(Math.round(releaseModalJob.agreedPrice * 0.1))}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 pt-2 border-t border-slate-200">
                  <span>Technician Payout (90% via Telebirr Direct):</span>
                  <span>{formatETB(releaseModalJob.agreedPrice - Math.round(releaseModalJob.agreedPrice * 0.1))}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setReleaseModalJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={isReleasingEscrow}
                onClick={handleConfirmAndRelease}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isReleasingEscrow ? "Releasing Payout..." : "Confirm & Send Telebirr Payout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATING & REVIEW MODAL */}
      {reviewJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Rate &amp; Review Technician
              </h3>
              <button
                onClick={() => setReviewJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  How was your experience?
                </label>
                <StarRating
                  rating={ratingVal}
                  interactive={true}
                  onRatingChange={setRatingVal}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comments / Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of the technician's punctuality, skill, and cleanliness..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReviewJob(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Skip
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : t.submitReview}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading dashboard...</div>}>
      <ClientDashboardContent />
    </Suspense>
  );
}
