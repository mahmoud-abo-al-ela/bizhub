"use client";

import { useRef } from "react";
import CompanyCard from "./CompanyCard";
import CompanyCardSkeleton from "./CompanyCardSkeleton";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function CompanyCarousel({ companies, isLoading }) {
  const sliderRef = useRef(null);

  if (isLoading) {
    return (
      <div className="carousel-container px-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-full">
              <CompanyCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium text-gray-600">
          No companies found
        </h3>
        <p className="text-gray-500 mt-2">
          Check back later or adjust your filters
        </p>
      </div>
    );
  }

  // Custom arrow components
  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-blue-600" />
      </button>
    );
  };

  const NextArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-blue-600" />
      </button>
    );
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    customPaging: (i) => (
      <div className="w-2 h-2 mx-1 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200"></div>
    ),
    dotsClass: "slick-dots custom-dots",
  };

  return (
    <div className="carousel-container px-8 relative">
      <style jsx global>{`
        .carousel-container .slick-dots {
          bottom: -30px;
        }
        .carousel-container .slick-dots li {
          margin: 0 3px;
        }
        .carousel-container .slick-dots li.slick-active div {
          background-color: #2563eb;
          width: 16px;
        }
        .carousel-container .slick-track {
          display: flex;
          gap: 1rem;
          margin-left: -0.5rem;
        }
        .carousel-container .slick-slide {
          padding: 0.5rem;
          height: auto;
        }
        .carousel-container .slick-slide > div {
          height: 100%;
        }
      `}</style>

      <Slider ref={sliderRef} {...settings}>
        {companies.map((company, index) => (
          <div key={company.id || index} className="h-full">
            <div className="transform transition-transform hover:scale-[1.02] duration-300 h-full">
              <CompanyCard company={company} />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
