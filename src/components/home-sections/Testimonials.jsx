// Final fixed Testimonials.jsx - resolving DOM props and loop warnings
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// bring in your original assets
import rafaelImg from "../../assets/img/Pessoas/Rafa.jpeg";
import goncaloImg from "../../assets/img/Pessoas/Gonçalo.png";

function Testimonials({ onAuthModalOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Hook for navigation
  const swiperRef = useRef(null);
  
  const defaultTestimonials = [
    {
      id: "static-1",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: rafaelImg,
    },
    {
      id: "static-2",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: goncaloImg,
    },
    {
      id: "static-3",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: rafaelImg,
    },
    {
      id: "static-4",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: goncaloImg,
    },
    {
      id: "static-5",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: rafaelImg,
    },
    {
      id: "static-6",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: goncaloImg,
    },
  ];

  // start with your default ones
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Add custom CSS via style tag directly in the component
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .swiper-pagination {
        position: relative !important;
        bottom: 0 !important;
        margin-top: 20px;
        display: flex;
        justify-content: center;
        z-index: 10;
      }
      .swiper-pagination-bullet {
        background: rgba(0, 0, 0, 0.5);
        opacity: 0.5;
        margin: 0 5px;
      }
      .swiper-pagination-bullet-active {
        background: #d4af37;
        opacity: 1;
      }
    `;
    
    // Append to document head
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // In the useEffect that fetches testimonials
  useEffect(() => {
    // Initial fetch of approved testimonials
    fetchApprovedTestimonials();

    // Set up a real-time subscription to testimonials changes
    const subscription = supabase
      .channel("testimonials-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "testimonials" },
        (payload) => {
          // If a testimonial was updated to 'approved' status, refresh the list
          if (payload.new.status === "approved") {
            fetchApprovedTestimonials();
          }
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Add a safe swiper update effect
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.swiper) {
          swiperRef.current.swiper.update();
          
          // Check if pagination exists before updating
          if (swiperRef.current.swiper.pagination && 
              typeof swiperRef.current.swiper.pagination.update === 'function') {
            swiperRef.current.swiper.pagination.update();
          }
          
          // Check if slideToLoop exists before calling
          if (typeof swiperRef.current.swiper.slideToLoop === 'function') {
            swiperRef.current.swiper.slideToLoop(0, 0);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [testimonials, loading]);

  async function fetchApprovedTestimonials() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform database URLs if necessary
      const processedData = data.map((item) => ({
        ...item,
        image_url: item.image_url.startsWith("http")
          ? item.image_url
          : `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/testimonials/${item.image_url}`,
      }));

      // Combine with default testimonials
      setTestimonials([...processedData, ...defaultTestimonials]);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleTestimonialButtonClick = () => {
    if (user) {
      // User is logged in, navigate to the new page
      navigate('/create-testimonial');
    } else {
      // User is not logged in, trigger the auth modal
      onAuthModalOpen();
    }
  };


  return (
    <section id="testimonials" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
        <h2 className="text-2xl md:text-4xl font-bold text-white">
          {t("testimonials.testimonials_title")}
        </h2>
        <p className="md:text-xl text-white">{t("testimonials.testimonials_description")}</p>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Pagination]}
            slidesPerView={1.2}
            spaceBetween={30}
            centeredSlides={true}
            initialSlide={0}
            loop={true}
            loopedslides={testimonials.length} // Use loopedSlides instead
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              renderBullet: function (index, className) {
                return '<span class="' + className + '" style="margin: 0 5px;"></span>';
              }
            }}
            className="testimonial-swiper overflow-visible"
            breakpoints={{
              768: {
                slidesPerView: 1, // Reduced from 1.2 to ensure loop works
                spaceBetween: 50,
              },
            }}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
            onInit={(swiper) => {
              // Force update after init
              setTimeout(() => {
                if (swiper && typeof swiper.update === 'function') {
                  swiper.update();
                  
                  if (swiper.pagination && typeof swiper.pagination.update === 'function') {
                    swiper.pagination.update();
                  }
                }
              }, 50);
            }}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={`testimonial-${testimonial.id || index}`}>
                <div
                  className="
                  bg-white 
                  w-full          
                  h-72           
                  p-4
                  rounded-lg
                  shadow-md
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  overflow-hidden
                  text-base
                "
                >
                  {/* Avatar */}
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.author}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-darkGold mb-4"
                  />

                  {/* Quote: allow internal scroll if needed */}
                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <p className="italic text-md md:text-xl px-2">"{testimonial.quote}"</p>
                  </div>

                  {/* Author */}
                  <div className="mt-4 font-semibold text-md md:text-xl">{testimonial.author}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        
        <button
          onClick={handleTestimonialButtonClick}
          className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
        >
          {t("testimonials.leave_testimonial")}
        </button>
      </div>
    </section>
  );
}

export default Testimonials;