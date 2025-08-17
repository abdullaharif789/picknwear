"use client";

import ShowTags from "@/components/product/ShowTags";
import RangeSlider from "@/components/rangeSlider/RangeSlider";
import { createUrl } from "@/lib/utils";
import { slugify } from "@/lib/utils/textConverter";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BsCheckLg, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { CustomCollection, CustomVendor } from "@/types/custom";

const ProductFilters = ({
  categories,
  vendors,
  tags,
  maxPriceData,
  vendorsWithCounts,
  categoriesWithCounts,
  sizes,
  colors,
}: {
  categories: CustomCollection[];
  vendors: CustomVendor[];
  tags: string[];
  maxPriceData: { amount: string; currencyCode: string };
  vendorsWithCounts: { vendor: string; productCount: number }[];
  categoriesWithCounts: { category: string; productCount: number }[];
  sizes: { size: string; productCount: number }[];
  colors: { color: string; productCount: number }[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrands = searchParams.getAll("b");
  const selectedCategory = searchParams.get("c");
  const selectedSizes = searchParams.getAll("size");
  const selectedColors = searchParams.getAll("color");

  // State for collapse/expand functionality
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  const handleBrandClick = (name: string) => {
    const slugName = slugify(name.toLowerCase());
    const newParams = new URLSearchParams(searchParams.toString());

    const currentBrands = newParams.getAll("b");

    if (currentBrands.includes(slugName)) {
      newParams.delete("b", slugName);
    } else {
      newParams.append("b", slugName);
    }
    router.push(createUrl("/products", newParams), { scroll: false });
  };

  const handleCategoryClick = (handle: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (handle === selectedCategory) {
      newParams.delete("c");
    } else {
      newParams.set("c", handle);
    }
    router.push(createUrl("/products", newParams), { scroll: false });
  };

  const handleSizeClick = (size: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const currentSizes = newParams.getAll("size");

    if (currentSizes.includes(size)) {
      newParams.delete("size", size);
    } else {
      newParams.append("size", size);
    }
    router.push(createUrl("/products", newParams), { scroll: false });
  };

  const handleColorClick = (color: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const currentColors = newParams.getAll("color");

    if (currentColors.includes(color)) {
      newParams.delete("color", color);
    } else {
      newParams.append("color", color);
    }
    router.push(createUrl("/products", newParams), { scroll: false });
  };

  // Get displayed items based on collapse state
  const displayedSizes = showAllSizes ? sizes : sizes.slice(0, 10);
  const displayedColors = showAllColors ? colors : colors.slice(0, 10);

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden pr-2 mb-6">
      <div>
        <h5 className="mb-2 lg:text-xl">Select Price Range</h5>
        <hr className="border-border dark:border-darkmode-border" />
        <div className="pt-4 px-3">
          <Suspense>
            <RangeSlider maxPriceData={maxPriceData} />
          </Suspense>
        </div>
      </div>

      <div>
        <h5 className="mb-2 mt-4 lg:mt-6 lg:text-xl">Product Categories</h5>
        <hr className="border-border dark:border-darkmode-border" />
        <ul className="mt-4 space-y-4">
          {categories.map((category) => (
            <li
              key={category.handle}
              className={`flex items-center justify-between cursor-pointer ${
                selectedCategory === category.handle
                  ? "text-text-dark dark:text-darkmode-text-dark font-semibold"
                  : "text-text-light dark:text-darkmode-text-light"
              }`}
              onClick={() => handleCategoryClick(category.handle)}
            >
              <span className="truncate flex-1">{category.title}</span>
              <span className="ml-2 text-sm">
                {searchParams.has("c") && !searchParams.has("b") ? (
                  <span>({category?.products?.edges.length!})</span>
                ) : (
                  <span>
                    {categoriesWithCounts.length > 0
                      ? `(${
                          categoriesWithCounts.find(
                            (c) => c.category === category.title,
                          )?.productCount || 0
                        })`
                      : `(${category?.products?.edges.length!})`}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {sizes && sizes.length > 0 && (
        <div>
          <h5 className="mb-2 mt-8 lg:mt-10 lg:text-xl">Sizes</h5>
          <hr className="border-border dark:border-darkmode-border" />
          <ul className="mt-4 space-y-4">
            {displayedSizes.map((sizeItem) => (
              <li
                key={sizeItem.size}
                className={`flex items-center justify-between cursor-pointer text-text-light dark:text-darkmode-text-light`}
                onClick={() => handleSizeClick(sizeItem.size)}
              >
                <span className="truncate flex-1">
                  {sizeItem.size} ({sizeItem.productCount})
                </span>
                <div className="h-4 w-4 rounded-sm flex items-center justify-center border border-border dark:border-border/40 ml-2 flex-shrink-0">
                  {selectedSizes.map((s, i) =>
                    sizeItem.size === s ? (
                      <span key={i}>
                        <BsCheckLg size={16} />
                      </span>
                    ) : null,
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Show More/Less button for sizes */}
          {sizes.length > 10 && (
            <button
              onClick={() => setShowAllSizes(!showAllSizes)}
              className="mt-4 text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              {showAllSizes ? (
                <>
                  <BsChevronUp size={14} />
                  Show Less
                </>
              ) : (
                <>
                  <BsChevronDown size={14} />
                  Show More ({sizes.length - 10} more)
                </>
              )}
            </button>
          )}
        </div>
      )}

      {colors && colors.length > 0 && (
        <div>
          <h5 className="mb-2 mt-8 lg:mt-10 lg:text-xl">Colors</h5>
          <hr className="border-border dark:border-darkmode-border" />
          <ul className="mt-4 space-y-4">
            {displayedColors.map((colorItem) => (
              <li
                key={colorItem.color}
                className={`flex items-center justify-between cursor-pointer text-text-light dark:text-darkmode-text-light`}
                onClick={() => handleColorClick(colorItem.color)}
              >
                <span className="truncate flex-1">
                  {colorItem.color} ({colorItem.productCount})
                </span>
                <div className="h-4 w-4 rounded-sm flex items-center justify-center border border-border dark:border-border/40 ml-2 flex-shrink-0">
                  {selectedColors.map((c, i) =>
                    colorItem.color === c ? (
                      <span key={i}>
                        <BsCheckLg size={16} />
                      </span>
                    ) : null,
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Show More/Less button for colors */}
          {colors.length > 10 && (
            <button
              onClick={() => setShowAllColors(!showAllColors)}
              className="mt-4 text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              {showAllColors ? (
                <>
                  <BsChevronUp size={14} />
                  Show Less
                </>
              ) : (
                <>
                  <BsChevronDown size={14} />
                  Show More ({colors.length - 10} more)
                </>
              )}
            </button>
          )}
        </div>
      )}

      {vendors && (
        <div>
          <h5 className="mb-2 mt-8 lg:mt-10 lg:text-xl">Brands</h5>
          <hr className="border-border dark:border-darkmode-border" />
          <ul className="mt-4 space-y-4">
            {vendors.map((vendor) => (
              <li
                key={vendor.vendor}
                className={`flex items-center justify-between cursor-pointer text-text-light dark:text-darkmode-text-light`}
                onClick={() => handleBrandClick(vendor.vendor)}
              >
                <span className="truncate flex-1">
                  {searchParams.has("b") &&
                  !searchParams.has("c") &&
                  !searchParams.has("minPrice") &&
                  !searchParams.has("maxPrice") &&
                  !searchParams.has("q") &&
                  !searchParams.has("t") ? (
                    <span>
                      {vendor.vendor} ({vendor.productCount})
                    </span>
                  ) : (
                    <span>
                      {vendorsWithCounts.length > 0
                        ? `${vendor.vendor} (${
                            vendorsWithCounts.find(
                              (v) => v.vendor === vendor.vendor,
                            )?.productCount || 0
                          })`
                        : `${vendor.vendor} (${vendor.productCount})`}
                    </span>
                  )}
                </span>
                <div className="h-4 w-4 rounded-sm flex items-center justify-center border border-border dark:border-border/40 ml-2 flex-shrink-0">
                  {selectedBrands.map((b, i) =>
                    slugify(vendor.vendor.toLowerCase()) === b ? (
                      <span key={i}>
                        <BsCheckLg size={16} />
                      </span>
                    ) : null,
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h5 className="mb-2 mt-8 lg:mt-10 lg:text-xl">Tags</h5>
          <hr className="border-border dark:border-darkmode-border" />
          <div className="mt-4">
            <Suspense>
              {" "}
              <ShowTags tags={tags} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
