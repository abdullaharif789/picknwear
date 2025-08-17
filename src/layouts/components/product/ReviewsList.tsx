"use client";

import { useEffect, useState } from "react";
import StarRating from "./StarRating";

interface Review {
  id: number;
  author_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

interface ReviewsListProps {
  productHandle: string;
  refreshTrigger?: number;
}

export default function ReviewsList({
  productHandle,
  refreshTrigger,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/products/${productHandle}/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = (await response.json())?.data;
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productHandle, refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="border-b border-border dark:border-border/40 pb-4">
        <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
        {reviews.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating
                rating={Math.round(averageRating)}
                readonly
                size="lg"
              />
              <span className="text-lg font-medium">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-text-light dark:text-darkmode-text-light">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="text-text-light dark:text-darkmode-text-light">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-border dark:border-border/40 pb-6 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{review.author_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-sm text-text-light dark:text-darkmode-text-light">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                {review.verified_purchase && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm leading-relaxed">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-light dark:text-darkmode-text-light">
            No reviews available for this product yet.
          </p>
        </div>
      )}
    </div>
  );
}
