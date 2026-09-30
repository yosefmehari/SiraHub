import React from "react";
import { ShieldCheck, Lock, CheckCircle } from "lucide-react";

interface EscrowBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "banner";
}

export default function EscrowBadge({ size = "md", variant = "badge" }: EscrowBadgeProps) {
  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-4 text-emerald-950">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <span>SiraHub Escrow Guarantee</span>
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold uppercase">
                100% Secure
              </span>
            </h4>
            <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
              Funds are held securely by Chapa / Telebirr. The technician is only paid <strong>after</strong> you inspect the completed work and click &quot;Confirm Job &amp; Release Funds&quot;.
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-emerald-700">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                No upfront cash risk
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified Addis Ababa Pros
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
      <Lock className="w-3 h-3 text-emerald-700" />
      <span>Escrow Protected</span>
    </span>
  );
}
