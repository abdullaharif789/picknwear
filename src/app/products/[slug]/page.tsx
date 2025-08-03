import Social from "@/components/Social";
import LoadingProductGallery from "@/components/loadings/skeleton/SkeletonProductGallery";
import ProductGallery from "@/components/product/ProductGallery";
import ShowTags from "@/components/product/ShowTags";
import Tabs from "@/components/product/Tabs";
import { VariantSelector } from "@/components/product/VariantSelector";
import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import {
  fetchProductByHandle,
  fetchAllProducts,
} from "@/lib/utils/fetchProducts";
import LatestProducts from "@/partials/FeaturedProducts";
import { BuyFromSource } from "@/components/cart/BuyFromSource";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomProduct } from "@/types/custom";

// Transform API data to match the expected format
const transformProductData = (apiProduct: any): CustomProduct => {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    handle: apiProduct.handle,
    featured_image: {
      url:
        apiProduct.featured_image?.url ||
        apiProduct.images?.[0]?.image_url ||
        "/images/product_image404.jpg",
      altText: apiProduct.name,
    },
    price: apiProduct.price,
    compare_at_price: apiProduct.compare_at_price,
    source: apiProduct.source,
    vendor: apiProduct.source?.store_name || "",
    collections: {
      nodes: [
        {
          title: apiProduct.source?.collection || "",
          handle: apiProduct.source?.collection || "",
        },
      ],
    },
    tags: [],
    variants: apiProduct.variants || [],
    source_url: apiProduct.source_url || "",
  };
};

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const params = await props.params;
  const product = await fetchProductByHandle(params.slug);
  if (!product) return notFound();

  return {
    title: product.name,
    description: product.body_html || product.name,
  };
};

const ProductSingle = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  return (
    <Suspense fallback={<LoadingProductGallery />}>
      <ShowProductSingle params={params} />
    </Suspense>
  );
};

export default ProductSingle;

const ShowProductSingle = async ({ params }: { params: { slug: string } }) => {
  const paymentsAndDelivery = getListPage("sections/payments-and-delivery.md");
  const { payment_methods, estimated_delivery } =
    paymentsAndDelivery.frontmatter;

  const { currencySymbol } = config.shopify;
  const product = await fetchProductByHandle(params.slug);

  if (!product) return notFound();

  const transformedProduct = transformProductData(product);

  // Get related products from the same source/store
  const relatedProducts = await fetchAllProducts({
    brand: product.source?.store_name,
    perPage: "10",
  });

  const relatedProductsTransformed = (relatedProducts?.data || [])
    .filter((p: any) => p.id !== product.id)
    .slice(0, 4)
    .map(transformProductData);

  const defaultVariantId =
    product.variants?.length > 0 ? product.variants[0].id : undefined;

  return (
    <>
      <section className="md:section-sm">
        <div className="container">
          <div className="row justify-center">
            {/* right side contents  */}
            <div className="col-10 md:col-8 lg:col-6">
              <Suspense>
                <ProductGallery images={product.images} />
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
                  {product.variants && product.variants.length > 0 && (
                    <VariantSelector
                      options={[
                        {
                          id: "size",
                          name: "Size",
                          values: product.variants
                            .map((v: any) => v.size)
                            .filter(Boolean),
                        },
                      ]}
                      variants={product.variants}
                      images={product.images}
                    />
                  )}
                </div>
              </div>

              {/* Buy From Source Button */}
              <div className="flex gap-4 mt-8 md:mt-10 mb-6">
                <BuyFromSource
                  product={transformedProduct as any}
                  isProductPage={true}
                />
              </div>

              <div className="mb-8 md:mb-10">
                <p className="p-2 max-md:text-sm rounded-md bg-light dark:bg-darkmode-light inline">
                  {estimated_delivery}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h5 className="max-md:text-base">Payment: </h5>
                {payment_methods?.map(
                  (payment: { name: string; image_url: string }) => (
                    <Image
                      key={payment.name}
                      src={payment.image_url}
                      alt={payment.name}
                      width={44}
                      height={32}
                      className="w-[44px] h-[32px]"
                    />
                  ),
                )}
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

      {/* Description of a product  */}
      {product.body_html && (
        <section>
          <div className="container">
            <div className="row">
              <div className="col-10 lg:col-11 mx-auto mt-12">
                <Tabs descriptionHtml={product.body_html} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recommended Products section  */}
      <section className="section">
        <div className="container">
          {relatedProductsTransformed?.length > 0 && (
            <>
              <div className="text-center mb-6 md:mb-14">
                <h2 className="mb-2">Related Products</h2>
              </div>
              <LatestProducts products={relatedProductsTransformed} />
            </>
          )}
        </div>
      </section>
    </>
  );
};
