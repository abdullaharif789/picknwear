import Social from "@/components/Social";
import LoadingProductGallery from "@/components/loadings/skeleton/SkeletonProductGallery";
import ProductGallery from "@/layouts/components/product/ProductGallery";
import ShowTags from "@/layouts/components/product/ShowTags";
import Tabs from "@/layouts/components/product/Tabs";
import {
  VariantSelector,
  useSelectedVariant,
} from "@/layouts/components/product/VariantSelector";
import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import {
  fetchProductByHandle,
  fetchAllProducts,
} from "@/lib/utils/fetchProducts";
import LatestProducts from "@/partials/FeaturedProducts";
import { BuyFromSource } from "@/layouts/components/cart/BuyFromSource";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomProduct } from "@/types/custom";
import ProductVariantHandler from "./ProductVariantHandler";
import ReviewsSection from "@/layouts/components/product/ReviewsSection";

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

// Transform API images to the expected format
const transformImages = (apiImages: any[]) => {
  if (!apiImages || !Array.isArray(apiImages)) return [];

  return apiImages.map((image, index) => ({
    url: image.image_url,
    altText: `Product Image ${index + 1}`,
    width: 722,
    height: 623,
  }));
};

// Transform API variants to the expected format
const transformVariants = (apiVariants: any[]) => {
  if (!apiVariants || !Array.isArray(apiVariants)) return [];

  return apiVariants.map((variant) => ({
    id: variant.id.toString(),
    variant_id: variant.variant_id,
    title: variant.title,
    price: variant.price,
    compare_at_price: variant.compare_at_price,
    sku: variant.sku,
    availableForSale: variant.available,
    selectedOptions: [
      {
        name: "Color",
        value: variant.color,
      },
      {
        name: "Size",
        value: variant.size,
      },
    ],
    size: variant.size,
    color: variant.color,
    featured_image: variant.featured_image,
  }));
};

// Get unique colors from variants
const getUniqueColors = (variants: any[]) => {
  if (!variants || !Array.isArray(variants)) return [];
  const colors = variants.map((v) => v.color).filter(Boolean);
  return [...new Set(colors)];
};

// Get unique sizes from variants
const getUniqueSizes = (variants: any[]) => {
  if (!variants || !Array.isArray(variants)) return [];
  const sizes = variants.map((v) => v.size).filter(Boolean);
  return [...new Set(sizes)];
};

// Get images for a specific color
const getImagesForColor = (images: any[], color: string, variants: any[]) => {
  if (!color || !images || !variants) return images;

  // Find variants with this color
  const colorVariants = variants.filter((v) => v.color === color);

  // Get featured images from these variants
  const variantImages = colorVariants
    .map((v) => v.featured_image)
    .filter(Boolean);

  // Filter main images that match the variant images
  const filteredImages = images.filter((image) =>
    variantImages.some((variantImage) => image.image_url === variantImage),
  );

  // If no filtered images found, return all images
  return filteredImages.length > 0 ? filteredImages : images;
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
  const transformedImages = transformImages(product.images);
  const transformedVariants = transformVariants(product.variants);

  // Get unique colors and sizes
  const uniqueColors = getUniqueColors(product.variants);
  const uniqueSizes = getUniqueSizes(product.variants);

  // Get related products from the same source/store
  const relatedProducts = await fetchAllProducts({
    brand: product.source?.store_name,
    perPage: "10",
  });

  const relatedProductsTransformed = (relatedProducts?.data || [])
    .filter((p: any) => p.id !== product.id)
    .slice(0, 4)
    .map(transformProductData);

  return (
    <>
      <ProductVariantHandler
        transformedProduct={transformedProduct}
        transformedVariants={transformedVariants}
        transformedImages={transformedImages}
        uniqueColors={uniqueColors}
        uniqueSizes={uniqueSizes}
        productImages={product.images}
        estimated_delivery={estimated_delivery}
        payment_methods={payment_methods}
        currencySymbol={currencySymbol}
        product={product}
      />

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

      {/* Reviews Section */}
      <ReviewsSection productHandle={params.slug} />

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
