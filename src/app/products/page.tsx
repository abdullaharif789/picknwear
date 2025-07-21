import SkeletonCategory from "@/components/loadings/skeleton/SkeletonCategory";
import { getListPage } from "@/lib/contentParser";
import { fetchAllProducts } from "@/lib/utils/fetchProducts";
import CallToAction from "@/partials/CallToAction";
import FeaturedProducts from "@/partials/FeaturedProducts";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";

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

const Home = () => {
  const callToAction = getListPage("sections/call-to-action.md");

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
