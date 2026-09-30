import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  totalReviews,
  interactive = false,
  onRatingChange,
  size = "md",
}: StarRatingProps) {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform p-0.5" : "cursor-default"}`}
          >
            <Star
              className={`${iconSizes[size]} ${
                star <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200 fill-slate-100"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && !interactive && (
        <span className="text-xs font-bold text-slate-700 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {typeof totalReviews === "number" && (
        <span className="text-xs text-slate-400">({totalReviews})</span>
      )}
    </div>
  );
}
