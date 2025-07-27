import SkeletonCategory from "@/components/loadings/skeleton/SkeletonCategory";
import { getListPage } from "@/lib/contentParser";
import { fetchAllProducts } from "@/lib/utils/fetchProducts";
import CallToAction from "@/partials/CallToAction";
import FeaturedProducts from "@/partials/FeaturedProducts";
import ProductFilters from "@/partials/ProductFilters";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";
import {
  getCollectionProducts,
  getCollections,
  getHighestProductPrice,
  getProducts,
  getVendors,
} from "@/lib/shopify";
import { PageInfo, Product } from "@/lib/shopify/types";
import { defaultSort, sorting } from "@/lib/constants";

interface SearchParams {
  sort?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  b?: string;
  c?: string;
  t?: string;
}

const ShowAllProducts = async () => {
  const allProducts = await fetchAllProducts({
    perPage: 200,
  });
  return (
    <FeaturedProducts
      products={allProducts?.data || []}
      hideAllProductsButton
    />
  );
};

const Home = async ({ searchParams }: { searchParams: SearchParams }) => {
  const {
    sort,
    q: searchValue,
    minPrice,
    maxPrice,
    b: brand,
    c: category,
    t: tag,
  } = searchParams as {
    [key: string]: string;
  };

  const { layout, cursor } = searchParams as { [key: string]: string };
  const callToAction = getListPage("sections/call-to-action.md");
  let productsData: any;
  let vendorsWithCounts: { vendor: string; productCount: number }[] = [];
  let categoriesWithCounts: { category: string; productCount: number }[] = [];

  const categories = await getCollections();
  const vendors = await getVendors({});
  const maxPriceData = await getHighestProductPrice();
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  if (searchValue || brand || minPrice || maxPrice || category || tag) {
    let queryString = "";

    if (minPrice || maxPrice) {
      queryString += `variants.price:<=${maxPrice} variants.price:>=${minPrice}`;
    }

    if (searchValue) {
      queryString += ` ${searchValue}`;
    }

    if (brand) {
      Array.isArray(brand)
        ? (queryString += `${brand.map((b) => `(vendor:${b})`).join(" OR ")}`)
        : (queryString += `vendor:"${brand}"`);
    }

    if (tag) {
      queryString += ` ${tag}`;
    }

    const query = {
      sortKey,
      reverse,
      query: queryString,
      cursor,
    };

    productsData =
      category && category !== "all"
        ? await getCollectionProducts({
            collection: category,
            sortKey,
            reverse,
          })
        : await getProducts(query);

    const uniqueVendors: string[] = [
      ...new Set(
        ((productsData?.products as Product[]) || []).map((product: Product) =>
          String(product?.vendor || ""),
        ),
      ),
    ];

    const uniqueCategories: string[] = [
      ...new Set(
        ((productsData?.products as Product[]) || []).flatMap(
          (product: Product) =>
            product.collections.nodes.map(
              (collectionNode: any) => collectionNode.title || "",
            ),
        ),
      ),
    ];

    vendorsWithCounts = uniqueVendors.map((vendor: string) => {
      const productCount = (productsData?.products || []).filter(
        (product: Product) => product?.vendor === vendor,
      ).length;
      return { vendor, productCount };
    });

    categoriesWithCounts = uniqueCategories.map((category: string) => {
      const productCount = ((productsData?.products as Product[]) || []).filter(
        (product: Product) =>
          product.collections.nodes.some(
            (collectionNode: any) => collectionNode.title === category,
          ),
      ).length;
      return { category, productCount };
    });
  } else {
    // Fetch all products
    productsData = await getProducts({ sortKey, reverse, cursor });
  }

  const tags = [
    ...new Set(
      (
        productsData as { pageInfo: PageInfo; products: Product[] }
      )?.products.flatMap((product: Product) => product.tags),
    ),
  ];
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
          <div className="col-3 hidden lg:block -mt-14">
            <Suspense>
              <ProductFilters
                categories={categories}
                vendors={vendors}
                tags={tags}
                maxPriceData={maxPriceData!}
                vendorsWithCounts={vendorsWithCounts}
                categoriesWithCounts={categoriesWithCounts}
              />
            </Suspense>
          </div>
          <Suspense fallback={<SkeletonCategory />}>
            <ShowAllProducts />
          </Suspense>
        </div>
      </section>

      <CallToAction data={callToAction} />
    </>
  );
};

export default Home;
