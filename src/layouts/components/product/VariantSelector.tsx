"use client";

import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { createUrl } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { BsX } from "react-icons/bs";
import { ImageItem } from "./ProductGallery";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

// Custom hook to get current selected variant
export const useSelectedVariant = (variants: ProductVariant[]) => {
  const searchParams = useSearchParams();
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >();

  useEffect(() => {
    const color = searchParams.get("color");
    const size = searchParams.get("size");

    if (color && size) {
      // Find the variant that matches both color and size
      const selectedVariant = variants.find((variant) => {
        const colorOption = variant.selectedOptions?.find(
          (opt) => opt.name === "Color",
        );
        const sizeOption = variant.selectedOptions?.find(
          (opt) => opt.name === "Size",
        );
        return colorOption?.value === color && sizeOption?.value === size;
      });

      setSelectedVariantId(selectedVariant?.id);
    } else if (variants.length > 0) {
      // Find the first available variant instead of just the first one
      const firstAvailableVariant = variants.find(
        (variant) => variant.availableForSale,
      );
      setSelectedVariantId(firstAvailableVariant?.id || variants[0].id);
    }
  }, [searchParams, variants]);

  return selectedVariantId;
};

export const generateImageMap = (
  images: ImageItem[],
  variants: any[],
  allImages: any[],
) => {
  const imageMap: { [color: string]: string } = {};

  // Create a map of color to featured image from variants
  variants.forEach((variant) => {
    if (variant.color && variant.featured_image && !imageMap[variant.color]) {
      imageMap[variant.color] = variant.featured_image;
    }
  });

  // If we don't have enough images from variants, try to find them in allImages
  if (Object.keys(imageMap).length === 0 && allImages) {
    variants.forEach((variant) => {
      if (variant.color && !imageMap[variant.color]) {
        // Try to find an image that contains the color name
        const colorLower = variant.color.toLowerCase();
        const matchingImage = allImages.find(
          (image) =>
            image.image_url.toLowerCase().includes(colorLower) ||
            image.image_url
              .toLowerCase()
              .includes(colorLower.replace(/\s+/g, "")),
        );

        if (matchingImage) {
          imageMap[variant.color] = matchingImage.image_url;
        }
      }
    });
  }

  // Fallback: use the first available image for each color
  if (Object.keys(imageMap).length === 0 && allImages && allImages.length > 0) {
    variants.forEach((variant, index) => {
      if (variant.color && !imageMap[variant.color]) {
        imageMap[variant.color] =
          allImages[index % allImages.length]?.image_url ||
          allImages[0]?.image_url;
      }
    });
  }

  return imageMap;
};

export function VariantSelector({
  options,
  variants,
  images,
  allImages,
  onVariantChange,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  images: any;
  allImages?: any[];
  onVariantChange?: (variantId: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedVariantId = useSelectedVariant(variants);

  const imageMap = useMemo(
    () => generateImageMap(images, variants, allImages || []),
    [images, variants, allImages],
  );

  const color = searchParams.get("color");
  const size = searchParams.get("size");

  // Helper function to get first available value for an option
  const getFirstAvailableValue = useCallback(
    (optionName: string) => {
      const option = options.find((opt) => opt.name === optionName);
      if (!option) return undefined;

      // Find the first available variant for this option
      for (const value of option.values) {
        const isAvailable = variants.some((variant) => {
          const optionValue = variant.selectedOptions?.find(
            (opt) => opt.name === optionName,
          )?.value;
          return optionValue === value && variant.availableForSale;
        });
        if (isAvailable) return value;
      }

      // Fallback to first value if no available variants found
      return option.values[0];
    },
    [options, variants],
  );

  // Check if color and size search parameters exist
  const hasColorAndSizeParams = color && size;

  // Set default option based on the existence of search parameters
  const defaultOption = useMemo(() => {
    return hasColorAndSizeParams
      ? {
          color:
            options
              .find((option) => option.name === "Color")
              ?.values.includes(color) ||
            options
              .find((option) => option.name === "Size")
              ?.values.includes(color)
              ? color
              : getFirstAvailableValue("Color"),
          size:
            options
              .find((option) => option.name === "Size")
              ?.values.includes(size) ||
            options
              .find((option) => option.name === "Color")
              ?.values.includes(size)
              ? size
              : getFirstAvailableValue("Size"),
        }
      : {
          color: getFirstAvailableValue("Color"),
          size: getFirstAvailableValue("Size"),
        };
  }, [hasColorAndSizeParams, color, size, options, getFirstAvailableValue]);

  const combinations = useMemo(
    () =>
      variants.map((variant) => ({
        id: variant.id,
        availableForSale: variant.availableForSale,
        ...variant?.selectedOptions?.reduce(
          (accumulator, option) => ({
            ...accumulator,
            [option.name.toLowerCase()]: option.value,
          }),
          {},
        ),
      })),
    [variants],
  );

  // Helper function to check if a variant combination is available
  const isVariantAvailable = useCallback(
    (optionName: string, value: string) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set(optionName.toLowerCase(), value);

      const filtered = Array.from(currentParams.entries()).filter(
        ([key, value]) =>
          options?.find(
            (option) =>
              option.name.toLowerCase() === key &&
              option.values.includes(value),
          ),
      );

      return combinations.find((combination) =>
        filtered.every(
          ([key, value]) =>
            (combination as any)[key] === value && combination.availableForSale,
        ),
      );
    },
    [searchParams, options, combinations],
  );

  // Helper function to check if an option is active
  const isOptionActive = useCallback(
    (optionName: string, value: string) => {
      const optionNameLowerCase = optionName.toLowerCase();
      return (
        searchParams.get(optionNameLowerCase) === value ||
        (!searchParams.get(optionNameLowerCase) &&
          value === (defaultOption as any)[optionNameLowerCase])
      );
    },
    [searchParams, defaultOption],
  );

  // Helper function to handle option selection
  const handleOptionSelect = useCallback(
    (optionName: string, value: string) => {
      const optionNameLowerCase = optionName.toLowerCase();
      const optionSearchParams = new URLSearchParams(searchParams.toString());
      optionSearchParams.set(optionNameLowerCase, value);
      const optionUrl = createUrl(pathname, optionSearchParams);
      router.replace(optionUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  // Notify parent component when variant changes - moved before conditional return
  useEffect(() => {
    if (selectedVariantId && onVariantChange) {
      onVariantChange(selectedVariantId);
    }
  }, [selectedVariantId, onVariantChange]);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  return (
    <div>
      {options.map((option) => (
        <div className="mb-6" key={option.id}>
          <h5 className="mb-2 max-md:text-base">{option.name}</h5>
          <div className="flex flex-wrap gap-3">
            {option.values.map((value) => {
              const isAvailable = isVariantAvailable(option.name, value);
              const isActive = isOptionActive(option.name, value);

              return (
                <div key={value}>
                  <button
                    aria-disabled={!isAvailable}
                    disabled={!isAvailable}
                    onClick={() => handleOptionSelect(option.name, value)}
                    title={`${option.name} ${value}${
                      !isAvailable ? " (Out of Stock)" : ""
                    }`}
                    className={`flex min-w-[48px] items-center justify-center border text-sm cursor-pointer ${
                      isActive
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-primary text-white"
                        : "border-border dark:border-border/40"
                    } ${
                      !isActive && isAvailable
                        ? "ring-1 ring-transparent hover:scale-105 hover:border-black hover:dark:border-white hover:ring-black hover:dark:ring-white hover:bg-gray-50 dark:hover:bg-gray-800"
                        : ""
                    } ${
                      !isAvailable
                        ? "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 opacity-50"
                        : ""
                    }`}
                  >
                    {/* Render the color image for the current value */}
                    {option.name === "Color" ? (
                      <div
                        className={`relative  overflow-hidden ${
                          isActive && "ring-2 ring-white"
                        }`}
                      >
                        <Image
                          src={
                            imageMap[value] || "/images/image-placeholder.png"
                          }
                          alt={value}
                          width={50}
                          height={50}
                          className={`${!isAvailable ? "opacity-50" : ""}`}
                        />
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-opacity-10">
                            <BsX className="text-red-600 text-xl font-bold" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-2 relative ${!isAvailable ? "opacity-50" : ""}`}
                      >
                        {value}
                        {/* Red cross for unavailable size */}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BsX className="text-red-600 text-lg font-bold" />
                          </div>
                        )}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
