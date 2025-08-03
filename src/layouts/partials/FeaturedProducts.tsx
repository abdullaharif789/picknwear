"use client";
import { BuyFromSource } from "@/components/cart/BuyFromSource";
import config from "@/config/config.json";
import ImageFallback from "@/helpers/ImageFallback";
import Link from "next/link";
import { CustomProduct } from "@/types/custom";

// Union type to handle both Product and CustomProduct
type ProductType = CustomProduct | any;

const FeaturedProducts = ({
  products,
  hideAllProductsButton,
  initialCols = 3,
}: {
  products: ProductType[];
  hideAllProductsButton?: boolean;
  initialCols?: number;
}) => {
  const { currencySymbol } = config.shopify;

  return (
    <>
      <div className="row">
        {products.map((product: ProductType) => {
          const {
            id,
            name,
            handle,
            featured_image,
            price,
            compare_at_price,
            source,
          } = product;

          return (
            <div
              key={id}
              className={`text-center col-12 md:col-${initialCols} lg:col-${initialCols} mb-8 md:mb-14 group relative`}
            >
              <div className="relative overflow-hidden">
                <ImageFallback
                  src={featured_image?.url || "/images/product_image404.jpg"}
                  width={312}
                  height={468}
                  alt={featured_image?.altText || "fallback image"}
                  className="w-full sm:w-[312px] h-auto sm:h-[468px] object-cover border border-border rounded-md"
                />

                <BuyFromSource product={product as any} isProductPage={false} />
              </div>

              <div className="py-2 md:py-4 text-center z-20">
                <h2 className="font-medium text-base md:text-xl line-clamp-1">
                  <Link
                    className="after:absolute after:inset-0"
                    href={`/products/${handle}`}
                  >
                    {name}
                  </Link>
                </h2>
                <div className="flex flex-wrap justify-center items-center gap-x-2 mt-2 md:mt-4">
                  <span className="text-base md:text-xl font-bold text-text-dark dark:text-darkmode-text-dark">
                    {currencySymbol} {price}{" "}
                  </span>

                  {parseFloat(compare_at_price) > 0 ? (
                    <s className="text-text-light dark:text-darkmode-text-light text-xs md:text-base font-medium">
                      {currencySymbol} {compare_at_price}
                    </s>
                  ) : (
                    ""
                  )}
                </div>
                <p className="text-sm">{source?.store_name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!hideAllProductsButton && (
        <div className="flex justify-center">
          <Link
            className="btn btn-sm md:btn-lg btn-primary font-medium"
            href={"/products"}
          >
            + See All Products
          </Link>
        </div>
      )}
    </>
  );
};

export default FeaturedProducts;
