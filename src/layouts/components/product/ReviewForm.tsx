"use client";

import { useState } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productHandle: string;
  onReviewSubmitted?: () => void;
}

interface ReviewFormData {
  author_name: string;
  rating: number;
  comment: string;
}

export default function ReviewForm({
  productHandle,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: "",
    rating: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (
    field: keyof ReviewFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.author_name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (formData.rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!formData.comment.trim()) {
      setError("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${productHandle}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Reset form
      setFormData({
        author_name: "",
        rating: 0,
        comment: "",
      });

      setSuccess("Review submitted successfully!");

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light dark:bg-darkmode-light p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="author_name"
            className="block text-sm font-medium mb-2"
          >
            Your Name *
          </label>
          <input
            type="text"
            id="author_name"
            value={formData.author_name}
            onChange={(e) => handleInputChange("author_name", e.target.value)}
            className="w-full px-3 py-2 border border-border dark:border-border/40 rounded-md bg-body dark:bg-darkmode-body focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => handleInputChange("rating", rating)}
          />
          {formData.rating > 0 && (
            <p className="text-sm text-text-light dark:text-darkmode-text-light mt-1">
              {formData.rating} star{formData.rating !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Review *
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border dark:border-border/40 rounded-md bg-body dark:bg-darkmode-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Share your experience with this product..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
