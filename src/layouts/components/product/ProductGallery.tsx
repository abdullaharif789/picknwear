"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  JSX,
  MouseEvent,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiZoomIn } from "react-icons/fi";
import {
  HiOutlineArrowNarrowLeft,
  HiOutlineArrowNarrowRight,
} from "react-icons/hi";
import type { Swiper as TSwiper } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import LoadingProductThumb from "../loadings/skeleton/SkeletonProductThumb";

export interface ImageItem {
  url: string;
  altText: string;
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface CustomZoomImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const CustomZoomImage = ({
  src,
  alt,
  width,
  height,
}: CustomZoomImageProps): JSX.Element => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [showMagnifier, setShowMagnifier] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [touchStartPosition, setTouchStartPosition] = useState<Position | null>(
    null,
  );
  const [touchMoveCount, setTouchMoveCount] = useState<number>(0);
  const imageRef = useRef<HTMLDivElement | null>(null);

  // Detect touch device on component mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const updatePosition = (clientX: number, clientY: number): void => {
    if (!imageRef.current) return;

    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();

    // Calculate position in percentage (0 to 1)
    const x = Math.max(0, Math.min(1, (clientX - left) / width));
    const y = Math.max(0, Math.min(1, (clientY - top) / height));

    setPosition({ x, y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    if (isTouchDevice) return;
    updatePosition(e.clientX, e.clientY);
  };

  // Handle touch events
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);

      // Store touch start position to determine if it was a tap or pan
      setTouchStartPosition({
        x: touch.clientX,
        y: touch.clientY,
      });

      setTouchMoveCount(0);

      // Only show magnifier on first touch if not already zoomed
      if (!isZoomed) {
        setShowMagnifier(true);
      }
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>): void => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
      setTouchMoveCount((prev) => prev + 1);
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>): void => {
    // If almost no movement (less than 5 position updates), consider it a tap
    if (touchMoveCount < 5 && touchStartPosition) {
      handleClick();
    }

    // Reset touch tracking
    setTouchStartPosition(null);

    // Hide magnifier on touch end if not zoomed
    if (!isZoomed) {
      setShowMagnifier(false);
    }
  };

  const handleClick = (): void => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-md ${
        !isZoomed && showMagnifier
          ? "cursor-zoom-in"
          : isZoomed
            ? "cursor-zoom-out"
            : ""
      }`}
      ref={imageRef}
      onMouseEnter={() => !isTouchDevice && setShowMagnifier(true)}
      onMouseLeave={() => !isTouchDevice && setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
      onClick={!isTouchDevice ? handleClick : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-contain"
        draggable={false}
      />

      {/* Magnifying glass icon - shown on hover for desktop, shown on touch for mobile */}
      {showMagnifier && !isZoomed && (
        <div
          className="absolute z-10 flex items-center justify-center bg-white opacity-70 rounded-full p-1 shadow-md"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            width: isTouchDevice ? "40px" : "24px",
            height: isTouchDevice ? "40px" : "24px",
          }}
        >
          <FiZoomIn size={isTouchDevice ? 24 : 16} />
        </div>
      )}

      {/* Zoomed view */}
      {isZoomed && (
        <div
          className="absolute top-0 left-0 right-0 bottom-0 cursor-zoom-out"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "200% 200%",
            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
            zIndex: 10,
          }}
        />
      )}

      {/* Touch zoom instructions - only shown briefly on first touch */}
      {isTouchDevice && isZoomed && (
        <div className="absolute bottom-2 left-0 right-0 text-center bg-black opacity-50 text-white py-1 text-sm z-20">
          Pan to move, tap to exit zoom
        </div>
      )}
    </div>
  );
};

// Get images for a specific color
const getImagesForColor = (
  allImages: any[],
  color: string,
  variants: any[],
) => {
  // If no color is selected or no variants exist, show all images
  if (!color || !variants || variants.length === 0) {
    return allImages;
  }

  // Find variants with this color
  const colorVariants = variants.filter((v) => v.color === color);

  // If no variants found for this color, show all images
  if (colorVariants.length === 0) {
    return allImages;
  }

  // Get featured images from these variants
  const variantImages = colorVariants
    .map((v) => v.featured_image)
    .filter(Boolean);

  // Filter main images that match the variant images
  const filteredImages = allImages.filter((image) =>
    variantImages.some((variantImage) => image.image_url === variantImage),
  );

  // If no filtered images found, try to find images that contain the color name in the URL
  if (filteredImages.length === 0) {
    const colorLower = color.toLowerCase();
    const colorFilteredImages = allImages.filter(
      (image) =>
        image.image_url.toLowerCase().includes(colorLower) ||
        image.image_url.toLowerCase().includes(colorLower.replace(/\s+/g, "")),
    );

    if (colorFilteredImages.length > 0) {
      return colorFilteredImages;
    }
  }

  // If still no filtered images found, return all images
  return filteredImages.length > 0 ? filteredImages : allImages;
};

interface ProductGalleryProps {
  images: ImageItem[];
  variants?: any[];
  allImages?: any[];
}

const ProductGallery = ({
  images,
  variants,
  allImages,
}: ProductGalleryProps): JSX.Element => {
  const [thumbsSwiper, setThumbsSwiper] = useState<TSwiper | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [loadingThumb, setLoadingThumb] = useState<boolean>(true);
  const [picUrl, setPicUrl] = useState<string>("");
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Detect touch device on component mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const searchParams = useSearchParams();
  const selectedColor = searchParams.get("color");

  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

  // Filter images based on selected color
  const filteredImages =
    selectedColor && variants && allImages && variants.length > 0
      ? getImagesForColor(allImages, selectedColor, variants)
      : images;

  // Transform filtered images to ImageItem format
  const displayImages: ImageItem[] = filteredImages.map((image, index) => ({
    url: image.image_url || image.url,
    altText: selectedColor
      ? `${selectedColor} - Image ${index + 1}`
      : `Product Image ${index + 1}`,
    width: 722,
    height: 623,
  }));

  useEffect(() => {
    if (selectedColor) {
      setActiveIndex(0);
    }
    setLoadingThumb(false);
  }, [selectedColor]);

  const handleSlideChange = (swiper: TSwiper): void => {
    setActiveIndex(swiper.activeIndex);
    setPicUrl(displayImages[swiper.activeIndex]?.url || "");
  };

  const handleThumbSlideClick = (clickedUrl: string): void => {
    const foundIndex: number = displayImages.findIndex(
      (item: ImageItem) => item.url === clickedUrl,
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    }
  };

  if (loadingThumb) {
    return <LoadingProductThumb />;
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Swiper
          spaceBetween={10}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSlideChange={handleSlideChange}
          allowTouchMove={!isHovered} // Disable Swiper touch when zooming is active
        >
          {displayImages.map((item: ImageItem) => (
            <SwiperSlide key={item.url}>
              <div className="mb-6 border border-border dark:border-border/40 rounded-md max-h-[623px] overflow-hidden">
                <CustomZoomImage
                  src={item.url}
                  alt={item.altText}
                  width={722}
                  height={623}
                />
              </div>
            </SwiperSlide>
          ))}
          <div
            className={`hidden lg:block w-full absolute top-1/2 -translate-y-1/2 z-10 px-6 text-text-dark ${
              isHovered
                ? "opacity-100 transition-opacity duration-300 ease-in-out"
                : "opacity-0 transition-opacity duration-300 ease-in-out"
            }`}
          >
            <div
              ref={prevRef}
              className="p-2 lg:p-4 rounded-md bg-body cursor-pointer shadow-sm absolute left-4"
            >
              <HiOutlineArrowNarrowLeft size={24} />
            </div>
            <div
              ref={nextRef}
              className="p-2 lg:p-4 rounded-md bg-body cursor-pointer shadow-sm absolute right-4"
            >
              <HiOutlineArrowNarrowRight size={24} />
            </div>
          </div>
        </Swiper>
      </div>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={isTouchDevice ? 3.5 : 4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
      >
        {displayImages.map((item: ImageItem) => (
          <SwiperSlide key={item.url}>
            <div
              onClick={() => handleThumbSlideClick(item.url)}
              className={`rounded-md cursor-pointer overflow-hidden ${
                picUrl === item.url
                  ? "border border-darkmode-border dark:border-yellow-500"
                  : "border border-border dark:border-border/40"
              }`}
            >
              <Image
                src={item.url}
                alt={item.altText}
                width={168}
                height={146}
                className="max-h-[146px]"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default ProductGallery;
