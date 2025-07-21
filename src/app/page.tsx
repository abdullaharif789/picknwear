export const dynamic = "force-dynamic";

import CollectionsSlider from "@/components/CollectionsSlider";
import HeroSlider from "@/components/HeroSlider";
import SkeletonCategory from "@/components/loadings/skeleton/SkeletonCategory";
import SkeletonFeaturedProducts from "@/components/loadings/skeleton/SkeletonFeaturedProducts";
import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import { getCollectionProducts, getCollections } from "@/lib/shopify";
import { fetchAllProducts } from "@/lib/utils/fetchProducts";
import CallToAction from "@/partials/CallToAction";
import FeaturedProducts from "@/partials/FeaturedProducts";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";

const ShowHeroSlider = async () => {
  const sliderImages = await fetchAllProducts({
    perPage: 5,
  });
  return <HeroSlider products={sliderImages?.data || []} />;
};

const ShowNewProducts = async () => {
  const newProducts = await fetchAllProducts({
    perPage: 4,
  });
  return (
    <FeaturedProducts
      products={newProducts?.data || []}
      hideAllProductsButton
    />
  );
};
const ShowFeaturedProducts = async () => {
  const featuredProducts = await fetchAllProducts({
    perPage: 12,
  });
  return <FeaturedProducts products={featuredProducts?.data || []} />;
};

const Home = () => {
  const callToAction = getListPage("sections/call-to-action.md");

  return (
    <>
      <SeoMeta />
      <section>
        <div className="container">
          <div className="bg-gradient py-10 rounded-md">
            <Suspense>
              <ShowHeroSlider />
            </Suspense>
          </div>
        </div>
      </section>

      {/* category section  */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-6 md:mb-14">
            <h2>New Arrivals 🔥</h2>
            <p className="md:h5">Discover the Latest Trends!</p>
          </div>
          <Suspense fallback={<SkeletonCategory />}>
            <ShowNewProducts />
          </Suspense>
        </div>
      </section>

      {/* Featured Products section  */}
      <section>
        <div className="container">
          <div className="text-center mb-6 md:mb-14">
            <h2 className="mb-2">Featured Products</h2>
            <p className="md:h5">Explore Today's Featured Picks!</p>
          </div>
          <Suspense fallback={<SkeletonFeaturedProducts />}>
            <ShowFeaturedProducts />
          </Suspense>
        </div>
      </section>

      <CallToAction data={callToAction} />
    </>
  );
};

export default Home;
