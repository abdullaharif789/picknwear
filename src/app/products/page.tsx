import SkeletonCategory from "@/components/loadings/skeleton/SkeletonCategory";
import { getListPage } from "@/lib/contentParser";
import { fetchAllProducts } from "@/lib/utils/fetchProducts";
import CallToAction from "@/partials/CallToAction";
import FeaturedProducts from "@/partials/FeaturedProducts";
import ProductFilters from "@/partials/ProductFilters";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";
import { defaultSort, sorting } from "@/lib/constants";
import ClientProducts from "@/components/ClientProducts";
import SearchProducts from "@/components/SearchProducts";
import MobileFilterToggle from "@/components/MobileFilterToggle";
import {
  CustomProduct,
  CustomCollection,
  CustomVendor,
  SearchParams,
} from "@/types/custom";

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

// Extract unique categories from products
const extractCategories = (products: CustomProduct[]): CustomCollection[] => {
  const categories = new Map();
  products.forEach((product) => {
    const category = product.source?.collection;
    if (category) {
      const count = categories.get(category) || 0;
      categories.set(category, count + 1);
    }
  });

  return Array.from(categories.entries()).map(([title, count]) => ({
    title,
    handle: title.toLowerCase().replace(/\s+/g, "-"),
    products: { edges: Array.from({ length: count as number }, () => ({})) },
  }));
};

// Extract unique vendors from products
const extractVendors = (products: CustomProduct[]): CustomVendor[] => {
  const vendors = new Map();
  products.forEach((product) => {
    const vendor = product.source?.store_name;
    if (vendor) {
      const count = vendors.get(vendor) || 0;
      vendors.set(vendor, count + 1);
    }
  });

  let _vendors = Array.from(vendors.entries()).map(([vendor, count]) => ({
    vendor,
    productCount: count as number,
  }));
  _vendors.sort((a, b) => a.vendor.localeCompare(b.vendor));
  return _vendors;
};

// Filter products based on search params
const filterProducts = (
  products: CustomProduct[],
  searchParams: SearchParams,
) => {
  let filteredProducts = [...products];

  // Filter by search query
  if (searchParams.q) {
    const query = searchParams.q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.source?.store_name?.toLowerCase().includes(query),
    );
  }

  // Filter by price range
  if (searchParams.minPrice || searchParams.maxPrice) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = parseFloat(product.price);
      const minPrice = searchParams.minPrice
        ? parseFloat(searchParams.minPrice)
        : 0;
      const maxPrice = searchParams.maxPrice
        ? parseFloat(searchParams.maxPrice)
        : Infinity;
      return price >= minPrice && price <= maxPrice;
    });
  }

  // Filter by brand/vendor
  if (searchParams.b) {
    const brands = Array.isArray(searchParams.b)
      ? searchParams.b
      : [searchParams.b];
    filteredProducts = filteredProducts.filter((product) =>
      brands.some(
        (brand) =>
          product.source?.store_name?.toLowerCase().replace(/\s+/g, "-") ===
          brand,
      ),
    );
  }

  // Filter by category
  if (searchParams.c) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.source?.collection?.toLowerCase().replace(/\s+/g, "-") ===
        searchParams.c,
    );
  }

  // Sort products
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === searchParams.sort) || defaultSort;

  filteredProducts.sort((a, b) => {
    let comparison = 0;

    switch (sortKey) {
      case "PRICE":
        comparison = parseFloat(a.price) - parseFloat(b.price);
        break;
      case "CREATED_AT":
        comparison = a.name.localeCompare(b.name);
        break;
      case "BEST_SELLING":
        comparison = a.name.localeCompare(b.name);
        break;
      case "RELEVANCE":
        comparison = a.name.localeCompare(b.name);
        break;
      default:
        comparison = 0;
    }

    return reverse ? -comparison : comparison;
  });

  return filteredProducts;
};

const ShowAllProducts = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  // Build filters for API call
  const apiFilters: Record<string, string | number | undefined> = {};

  if (searchParams.q) apiFilters.search = searchParams.q;
  if (searchParams.minPrice) apiFilters.min_price = searchParams.minPrice;
  if (searchParams.maxPrice) apiFilters.max_price = searchParams.maxPrice;
  if (searchParams.b)
    apiFilters.brand = Array.isArray(searchParams.b)
      ? searchParams.b.join(",")
      : searchParams.b;
  if (searchParams.c) apiFilters.category = searchParams.c;
  if (searchParams.sort) apiFilters.sort = searchParams.sort;
  if (searchParams.page) apiFilters.page = searchParams.page;
  apiFilters.perPage = searchParams.perPage || "54";

  const allProducts = await fetchAllProducts(apiFilters);
  const transformedProducts = transformProductData(allProducts?.data || []);

  return (
    <ClientProducts
      initialProducts={transformedProducts}
      searchParams={searchParams}
    />
  );
};

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const callToAction = getListPage("sections/call-to-action.md");

  // Get all products for filters
  const allProducts = await fetchAllProducts();
  const transformedProducts = transformProductData(allProducts?.data || []);

  // Extract filter data
  const categories = extractCategories(transformedProducts);
  const vendors = extractVendors(transformedProducts);

  // Calculate max price for range slider
  const maxPrice = Math.max(
    ...transformedProducts.map((p) => parseFloat(p.price) || 0),
  );
  const maxPriceData = { amount: maxPrice.toString(), currencyCode: "USD" };

  // Get filtered products for counts
  const filteredProducts = filterProducts(
    transformedProducts,
    resolvedSearchParams,
  );

  const vendorsWithCounts = vendors.map((vendor) => ({
    vendor: vendor.vendor,
    productCount: filteredProducts.filter(
      (p) => p.source?.store_name === vendor.vendor,
    ).length,
  }));

  const categoriesWithCounts = categories.map((category) => ({
    category: category.title,
    productCount: filteredProducts.filter(
      (p) => p.source?.collection === category.title,
    ).length,
  }));

  // Extract tags (empty for now, can be extended)
  const tags: string[] = [];

  return (
    <>
      <SeoMeta />

      <section className="section">
        <div className="container">
          <div className="mb-6 md:mb-14">
            <h2>All Products 🔥</h2>
            <p className="md:h5">
              Explore our extensive range of products, handpicked just for you.
            </p>
          </div>

          {/* Search Component */}
          <div className="mb-6">
            <SearchProducts />
          </div>

          {/* Mobile Filter Toggle */}
          <MobileFilterToggle>
            <ProductFilters
              categories={categories as any}
              vendors={vendors}
              tags={tags}
              maxPriceData={maxPriceData}
              vendorsWithCounts={vendorsWithCounts}
              categoriesWithCounts={categoriesWithCounts}
            />
          </MobileFilterToggle>

          {/* Main Content Grid */}
          <div className="row">
            {/* Filters Sidebar - Hidden on mobile, col-3 on desktop */}
            <div className="hidden lg:block lg:col-3">
              <div className="sticky top-4">
                <Suspense>
                  <ProductFilters
                    categories={categories as any}
                    vendors={vendors}
                    tags={tags}
                    maxPriceData={maxPriceData}
                    vendorsWithCounts={vendorsWithCounts}
                    categoriesWithCounts={categoriesWithCounts}
                  />
                </Suspense>
              </div>
            </div>

            {/* Products Grid - col-9 on desktop, full width on mobile */}
            <div className="col-12 lg:col-9">
              <Suspense fallback={<SkeletonCategory />}>
                <ShowAllProducts searchParams={resolvedSearchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <CallToAction data={callToAction} />
    </>
  );
};

export default Home;
