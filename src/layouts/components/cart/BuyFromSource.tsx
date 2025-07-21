"use client";

import { Product } from "@/lib/shopify/types";
import React from "react";

export function BuyFromSource({ product }: { product: Product }) {
  return (
    <a
      aria-label="Buy From Source"
      className={`btn btn-primary max-md:btn-sm z-10 absolute bottom-12 md:bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full md:group-hover:-translate-y-6 duration-300 ease-in-out whitespace-nowrap drop-shadow-md`}
      href={product.source_url}
      target="_blank"
    >
      Buy From Source
    </a>
  );
}
