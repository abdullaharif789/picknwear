"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createUrl } from "@/lib/utils";

const SearchProducts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }

    router.push(createUrl("/products", newParams), { scroll: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-md"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchProducts;
