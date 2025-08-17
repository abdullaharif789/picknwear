"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Social from "@/components/Social";
import ProductGallery from "@/layouts/components/product/ProductGallery";
import ShowTags from "@/layouts/components/product/ShowTags";
import {
  VariantSelector,
  useSelectedVariant,
} from "@/layouts/components/product/VariantSelector";
import { BuyFromSource } from "@/layouts/components/cart/BuyFromSource";

interface ProductVariantHandlerProps {
  transformedProduct: any;
  transformedVariants: any[];
  transformedImages: any[];
  uniqueColors: string[];
  uniqueSizes: string[];
  productImages: any[];
  estimated_delivery: string;
  payment_methods: any[];
  currencySymbol: string;
  product: any;
}

export default function ProductVariantHandler({
  transformedProduct,
  transformedVariants,
  transformedImages,
  uniqueColors,
  uniqueSizes,
  productImages,
  estimated_delivery,
  payment_methods,
  currencySymbol,
  product,
}: ProductVariantHandlerProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the selected variant ID from URL parameters
  const currentSelectedVariantId = useSelectedVariant(transformedVariants);

  // Set initial URL parameters to first available variant if no parameters exist
  useEffect(() => {
    const color = searchParams.get("color");
    const size = searchParams.get("size");

    if (!color && !size && transformedVariants.length > 0) {
      const firstAvailableVariant = transformedVariants.find(
        (variant) => variant.availableForSale,
      );
      if (firstAvailableVariant) {
        const colorOption = firstAvailableVariant.selectedOptions?.find(
          (opt: any) => opt.name === "Color",
        );
        const sizeOption = firstAvailableVariant.selectedOptions?.find(
          (opt: any) => opt.name === "Size",
        );

        if (colorOption && sizeOption) {
          const newParams = new URLSearchParams();
          newParams.set("color", colorOption.value);
          newParams.set("size", sizeOption.value);

          // Update URL without triggering a page reload
          const newUrl = `${window.location.pathname}?${newParams.toString()}`;
          router.replace(newUrl, { scroll: false });
        }
      }
    }
  }, [transformedVariants, searchParams, router]);

  useEffect(() => {
    setSelectedVariantId(currentSelectedVariantId);
  }, [currentSelectedVariantId]);

  return (
    <section className="md:section-sm">
      <div className="container">
        <div className="row justify-center">
          {/* right side contents  */}
          <div className="col-10 md:col-8 lg:col-6">
            <Suspense>
              <ProductGallery
                images={transformedImages}
                variants={transformedVariants}
                allImages={productImages}
              />
            </Suspense>
          </div>

          {/* left side contents  */}
          <div className="col-10 md:col-8 lg:col-5 md:ml-7 py-6 lg:py-0">
            <h1 className="text-3xl md:h2 mb-2 md:mb-6">{product.name}</h1>

            <div className="flex gap-2 items-center">
              <h4 className="text-text-light dark:text-darkmode-text-light max-md:h2">
                {currencySymbol} {product.price}
              </h4>
              {parseFloat(product.compare_at_price) > 0 ? (
                <s className="text-text-light max-md:h3 dark:text-darkmode-text-light">
                  {currencySymbol} {product.compare_at_price}
                </s>
              ) : (
                ""
              )}
            </div>

            {/* Store Information */}
            <div className="mt-4 mb-6">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">
                Sold by:{" "}
                <span className="font-medium">
                  {product.source?.store_name}
                </span>
              </p>
            </div>

            <div className="my-10 md:my-10 space-y-6 md:space-y-10">
              <div>
                {transformedVariants && transformedVariants.length > 0 && (
                  <VariantSelector
                    options={[
                      {
                        id: "color",
                        name: "Color",
                        values: uniqueColors,
                      },
                      {
                        id: "size",
                        name: "Size",
                        values: uniqueSizes,
                      },
                    ]}
                    variants={transformedVariants}
                    images={transformedImages}
                    allImages={productImages}
                    onVariantChange={setSelectedVariantId}
                  />
                )}
              </div>
            </div>

            {/* Buy From Source Button */}
            <div className="flex gap-4 mt-8 md:mt-10 mb-6">
              <BuyFromSource
                product={transformedProduct as any}
                isProductPage={true}
                variantId={selectedVariantId}
              />
            </div>

            <div className="mb-8 md:mb-10">
              <p className="p-2 max-md:text-sm rounded-md bg-light dark:bg-darkmode-light inline">
                {estimated_delivery}
              </p>
            </div>

            <hr className="my-6 border border-border dark:border-border/40" />

            <div className="flex gap-3 items-center mb-6">
              <h5 className="max-md:text-base">Share:</h5>
              <Social socialName={product.name} className="social-icons" />
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center">
                <h5 className="max-md:text-base">Tags:</h5>
                <Suspense>
                  <ShowTags tags={product.tags} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
