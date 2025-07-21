"use client";

import ImageFallback from "@/helpers/ImageFallback";
import { Product } from "@/lib/shopify/types";
import Link from "next/link";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import config from "@/config/config.json";

const HeroSlider = ({ products }: { products: Product[] }) => {
  const { currencySymbol } = config.shopify;
  return (
    <>
      <Swiper
        pagination={{
          clickable: true,
          bulletClass: "banner-pagination-bullet",
          bulletActiveClass: "banner-pagination-bullet-active",
        }}
        modules={[Pagination]}
      >
        {products?.map((item: Product) => (
          <SwiperSlide key={item.id}>
            <div className="row items-center px-7 xl:px-16">
              <div className="sm:col-12 lg:col-6 order-2 lg:order-0">
                <div className="text-center py-10 lg:py-0">
                  <p className="mb-2 lg:mb-3 text-text-light dark:text-darkmode-text-light font-medium md:text-xl">
                    Buy from {item?.source?.store_name} at {currencySymbol}
                    {item.price}
                  </p>
                  <div className="row">
                    <h1 className="mb-4 lg:mb-10 col-10 sm:col-8 lg:col-12 mx-auto">
                      {item.name}
                    </h1>
                  </div>
                  {item.source_url && (
                    <Link
                      className="btn btn-sm md:btn-lg btn-primary font-medium"
                      href={`${item.source_url}`}
                      target="_blank"
                    >
                      Buy From Source
                    </Link>
                  )}
                </div>
              </div>

              <div className="sm:col-12 lg:col-6">
                {item.images.length > 0 && (
                  <div className="relative w-full aspect-square overflow-hidden">
                    <ImageFallback
                      src={item.images[0].image_url}
                      alt="banner image"
                      fill
                      className="object-cover"
                      priority={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default HeroSlider;
