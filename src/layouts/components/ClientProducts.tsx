"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FeaturedProducts from "@/partials/FeaturedProducts";
import { fetchAllProducts } from "@/lib/utils/fetchProducts";
import { CustomProduct, SearchParams } from "@/types/custom";

// Transform API data to match the expected format
const transformProductData = (apiProducts: any[]): CustomProduct[] => {
  return apiProducts.map((product) => ({
    id: product.id,
    name: product.name,
    handle: product.handle,
    featured_image: {
      url:
        product.featured_image?.url ||
        product.images?.[0]?.image_url ||
        "/images/product_image404.jpg",
      altText: product.name,
    },
    price: product.price,
    compare_at_price: product.compare_at_price,
    source: product.source,
    vendor: product.source?.store_name || "",
    collections: {
      nodes: [
        {
          title: product.source?.collection || "",
          handle: product.source?.collection || "",
        },
      ],
    },
    tags: [],
    variants: product.variants || [],
    source_url: product.source_url || "",
  }));
};

const ClientProducts = ({
  initialProducts,
  searchParams,
}: {
  initialProducts: CustomProduct[];
  searchParams: SearchParams;
}) => {
  const [products, setProducts] = useState<CustomProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const currentSearchParams = useSearchParams();

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      setCurrentPage(1);

      try {
        // Build filters for API call
        const apiFilters: Record<string, string | number | undefined> = {};

        const q = currentSearchParams.get("q");
        const minPrice = currentSearchParams.get("minPrice");
        const maxPrice = currentSearchParams.get("maxPrice");
        const b = currentSearchParams.get("b");
        const c = currentSearchParams.get("c");
        const sort = currentSearchParams.get("sort");

        if (q) apiFilters.search = q;
        if (minPrice) apiFilters.min_price = minPrice;
        if (maxPrice) apiFilters.max_price = maxPrice;
        if (b) apiFilters.brand = b;
        if (c) apiFilters.category = c;
        if (sort) apiFilters.sort = sort;
        apiFilters.page = "1";
        apiFilters.perPage = "54";

        const allProducts = await fetchAllProducts(apiFilters);
        const transformedProducts = transformProductData(
          allProducts?.data || [],
        );
        setProducts(transformedProducts);

        // Check if there are more products
        setHasMore(true);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
        // Fallback to client-side filtering
        setProducts(initialProducts);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchFilteredProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [currentSearchParams, initialProducts]);

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      // Build filters for API call
      const apiFilters: Record<string, string | number | undefined> = {};

      const q = currentSearchParams.get("q");
      const minPrice = currentSearchParams.get("minPrice");
      const maxPrice = currentSearchParams.get("maxPrice");
      const b = currentSearchParams.get("b");
      const c = currentSearchParams.get("c");
      const sort = currentSearchParams.get("sort");

      if (q) apiFilters.search = q;
      if (minPrice) apiFilters.min_price = minPrice;
      if (maxPrice) apiFilters.max_price = maxPrice;
      if (b) apiFilters.brand = b;
      if (c) apiFilters.category = c;
      if (sort) apiFilters.sort = sort;
      apiFilters.page = nextPage.toString();
      apiFilters.perPage = "54";

      const allProducts = await fetchAllProducts(apiFilters);
      const transformedProducts = transformProductData(allProducts?.data || []);

      setProducts((prev) => [...prev, ...transformedProducts]);
      setCurrentPage(nextPage);
      setHasMore(true);
    } catch (error) {
      setHasMore(false);
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="text-center col-6 md:col-4 lg:col-3 mb-8 md:mb-14"
          >
            <div className="animate-pulse">
              <div className="w-[312px] h-[468px] bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <FeaturedProducts
        products={products}
        hideAllProductsButton
        initialCols={4}
      />

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="btn btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              "Load More Products"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientProducts;
