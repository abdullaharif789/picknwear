"use client";

import { Product } from "@/lib/shopify/types";
import React from "react";

interface BuyFromSourceProps {
  product: Product;
  className?: string;
  isProductPage?: boolean;
  variantId?: string;
}

export function BuyFromSource({
  product,
  className = "",
  isProductPage = false,
  variantId,
}: BuyFromSourceProps) {
  const baseClasses = isProductPage
    ? "btn btn-primary max-md:btn-sm"
    : "btn btn-primary max-md:btn-sm z-10 absolute bottom-12 md:bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full md:group-hover:-translate-y-6 duration-300 ease-in-out whitespace-nowrap drop-shadow-md";

  // Build the URL with variant ID if provided
  const buildSourceUrl = () => {
    if (!product.source_url) return "#";

    const url = new URL(product.source_url);
    if (variantId) {
      url.searchParams.set("variant", variantId);
    }
    return url.toString();
  };

  return (
    <a
      aria-label="Buy From Source"
      className={`${baseClasses} ${className}`}
      href={buildSourceUrl()}
      target="_blank"
      rel="noopener noreferrer"
    >
      Buy From Source
    </a>
  );
}
