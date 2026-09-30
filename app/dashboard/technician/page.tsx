"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { JobRequest, JobStatus, TechnicianProfile } from "@/types";
import { MOCK_JOBS, MOCK_TECHNICIANS } from "@/lib/data/mock-data";
import StarRating from "@/components/StarRating";
import { formatETB, formatDate } from "@/lib/utils";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  Power,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  const { t } = useI18n();

  // Demo technician logged in: Abebe Kebede (tech-1 / usr-tech-1)
  const [techProfile, setTechProfile] = useState<TechnicianProfile>(MOCK_TECHNICIANS[0]);
  const [jobs, setJobs] = useState<JobRequest[]>(MOCK_JOBS);
  const [isAvailable, setIsAvailable] = useState<boolean>(MOCK_TECHNICIANS[0].isAvailable);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchTechData = () => {
    fetch("/api/technicians/tech-1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTechProfile(data);
          setIsAvailable(data.isAvailable);
        }
      })
      .catch(() => {});

    fetch("/api/jobs?technicianId=usr-tech-1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setJobs(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTechData();
  }, []);

  // Toggle Online/Offline
  const handleToggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      setIsAvailable(nextState);

      await fetch("/api/technicians/tech-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextState }),
      });

      setNotification(
        nextState
          ? "You are now ONLINE. Addis Ababa clients can book your services immediately!"
          : "You are now OFFLINE. You won't appear as available for urgent calls."
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Update job status (Accept, Decline, Start Work, Mark Completed)
  const handleUpdateJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        if (status === "COMPLETED") {
          setNotification("Job marked as COMPLETED! Client has been notified to inspect and release your 90% payout via Telebirr.");
        } else if (status === "ACCEPTED") {
          setNotification("Job ACCEPTED! Client notified.");
        } else if (status === "CANCELLED") {
          setNotification("Job request declined.");
        }
        setTimeout(() => setNotification(null), 6000);
        fetchTechData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Calculate earnings stats
  const totalCompletedJobs = jobs.filter((j) => j.status === "COMPLETED");
  const releasedEarnings = totalCompletedJobs
    .filter((j) => j.paymentStatus === "RELEASED")
    .reduce((sum, j) => sum + (j.agreedPrice * 0.9), 0);

  const pendingEscrow = jobs
    .filter((j) => j.paymentStatus === "HELD_IN_ESCROW")
    .reduce((sum, j) => sum + (j.agreedPrice * 0.9), 0);

  const incomingRequests = jobs.filter((j) => j.status === "PENDING");
  const activeInProgress = jobs.filter(
    (j) => j.status === "ACCEPTED" || j.status === "IN_PROGRESS" || (j.status === "COMPLETED" && j.paymentStatus === "HELD_IN_ESCROW")
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Profile & Availability Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={techProfile.user.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"}
                alt={techProfile.user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  {techProfile.user.name}
                </h1>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Verified Master Plumber
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {techProfile.user.subCity} • Addis Ababa • Rate: {formatETB(techProfile.hourlyRate)}/hr
              </p>
              <div className="mt-1">
                <StarRating rating={techProfile.ratingAverage} totalReviews={techProfile.totalJobs} size="sm" />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 block">
                {isAvailable ? "Online & Ready" : "Currently Offline"}
              </span>
              <span className="text-[10px] text-slate-400">
                {isAvailable ? "Visible in Addis search" : "Hidden from search"}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAvailable ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAvailable ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700">
              Dismiss
            </button>
          </div>
        )}

        {/* Earnings & Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Released Earnings (90%)
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {formatETB(releasedEarnings)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Transferred to Telebirr mobile wallet
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Held in Escrow (Pending)
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {formatETB(pendingEscrow)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Locked safely until jobs completed
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Jobs Completed
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {techProfile.totalJobs}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              100% Client Satisfaction score
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Platform Fee Deduction
            </span>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">
              10%
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Zero upfront listing or lead fee
            </p>
          </div>
        </div>

        {/* SECTION 1: Incoming Job Requests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{t.pendingRequests}</span>
              {incomingRequests.length > 0 && (
                <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {incomingRequests.length} New
                </span>
              )}
            </h2>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No new incoming requests right now. Keep your status online to receive calls in Addis Ababa!
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {job.category?.nameEn}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{job.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600">{job.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {job.subCity} {job.woreda && `(${job.woreda})`} • {job.address}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Client: {job.client?.name || "Client"} ({job.client?.phone || "+251911000000"})
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Offered Budget
                      </span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {formatETB(job.agreedPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (90% payout: {formatETB(job.agreedPrice * 0.9)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "CANCELLED")}
                        className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "ACCEPTED")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                      >
                        {t.acceptJob}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: Active / In-Progress Jobs */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Active Jobs &amp; Escrow Progress
          </h2>

          {activeInProgress.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No active jobs in progress at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {activeInProgress.map((job) => {
                const isCompletedAwaiting =
                  job.status === "COMPLETED" && job.paymentStatus === "HELD_IN_ESCROW";

                return (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                          {job.category?.nameEn}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Client: {job.client?.name} • Phone: {job.client?.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {job.status === "COMPLETED" ? "Work Completed" : "In Progress"}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Escrow Secured
                        </span>
                      </div>
                    </div>

                    <div className="py-3 text-xs text-slate-600 leading-relaxed">
                      {job.description}
                      <div className="mt-2 flex items-center gap-1.5 text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {job.subCity} {job.woreda && `(${job.woreda})`} • {job.address}
                        </span>
                      </div>
                    </div>

                    {/* Progress action button */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-slate-400">Agreed Price: </span>
                        <span className="font-bold text-slate-900">
                          {formatETB(job.agreedPrice)}
                        </span>
                        <span className="text-emerald-700 font-bold ml-2">
                          (Your 90% Payout: {formatETB(job.agreedPrice * 0.9)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, "COMPLETED")}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t.markCompleted}</span>
                          </button>
                        )}

                        {isCompletedAwaiting && (
                          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting client inspection &amp; release
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
