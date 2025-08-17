"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

interface ReviewsSectionProps {
  productHandle: string;
}

export default function ReviewsSection({ productHandle }: ReviewsSectionProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "write">("reviews");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    // Switch to reviews tab and refresh the list
    setActiveTab("reviews");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="col-10 lg:col-11 mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

              {/* Tabs */}
              <div className="flex border-b border-border dark:border-border/40">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-3 font-medium transition-colors duration-200 ${
                    activeTab === "reviews"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-light dark:text-darkmode-text-light hover:text-text dark:hover:text-white"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab("write")}
                  className={`px-6 py-3 font-medium transition-colors duration-200 ${
                    activeTab === "write"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-light dark:text-darkmode-text-light hover:text-text dark:hover:text-white"
                  }`}
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === "reviews" ? (
                <ReviewsList
                  productHandle={productHandle}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                <ReviewForm
                  productHandle={productHandle}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
