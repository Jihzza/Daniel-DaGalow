// Final fixed Testimonials.jsx - resolving DOM props and loop warnings
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useAuth } from "../../contexts/AuthContext";

// bring in your original assets
import rafaelImg from "../../assets/img/Pessoas/Rafa.jpeg";
import goncaloImg from "../../assets/img/Pessoas/Gonçalo.png";

function Testimonials({ onAuthModalOpen }) {
  const { t } = useTranslation();
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
  const [isAuthRequired, setIsAuthRequired] = useState(false);

  // Modal & form state
  const [isModalOpen, setModalOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      // User is logged in, show testimonial form
      setModalOpen(true);
    } else {
      // User is not logged in, trigger the auth modal
      onAuthModalOpen(); // You'd need to pass this as a prop to the component
    }
  };

  // handle new submission
  const handleSubmit = async () => {
    if (!author.trim() || !quote.trim() || !imageFile) {
      alert(t("testimonials.modal_validation"));
      return;
    }

    if (!user) {
      alert(t("testimonials.modal_auth_required"));
      return;
    }

    setSubmitting(true);

    try {
      // upload image
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      let { error: upErr } = await supabase.storage
        .from("testimonials")
        .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      // get URL
      let { data: urlData, error: urlErr } = supabase.storage
        .from("testimonials")
        .getPublicUrl(fileName);
      if (urlErr) throw urlErr;

      // insert record
      let { data: newT, error: insErr } = await supabase
        .from("testimonials")
        .insert({
          user_id: user.id,
          author: author.trim(),
          quote: quote.trim(),
          image_url: urlData.publicUrl,
          status: "pending",
        })
        .single();
      if (insErr) throw insErr;

      // update state: put new one at top
      setTestimonials((prev) => [newT, ...prev]);
      setModalOpen(false);
      setAuthor("");
      setQuote("");
      setImageFile(null);
      alert(t("testimonials.modal_success"));
    } catch (error) {
      console.error("Submission error:", error);
      alert(t("testimonials.modal_error"));
    } finally {
      setSubmitting(false);
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

      {/* Modal with updated layout order */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-oxfordBlue rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-fade-in">
            <div className="border-b border-darkGold/30 p-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {t("testimonials.modal_title")}
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                {t("testimonials.modal_subtitle")}
              </p>
            </div>

            <div className="p-4 space-y-6">
              {/* Image upload with preview - NOW FIRST */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  {t("testimonials.modal_photo_label")}
                </label>
                <div className="flex flex-col items-center space-y-4">
                  {imageFile ? (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-darkGold">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-darkGold border-dashed flex items-center justify-center text-darkGold/50">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                    </div>
                  )}

                  <label className="w-full">
                    <div className="px-4 py-2 bg-darkGold text-black font-medium rounded-lg hover:bg-opacity-90 transition cursor-pointer text-center">
                      {imageFile
                        ? t("testimonials.modal_photo_change")
                        : t("testimonials.modal_photo_select")}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                {!imageFile && (
                  <p className="text-gray-400 text-xs md:text-base text-center">
                    {t("testimonials.modal_photo_placeholder")}
                  </p>
                )}
              </div>

              {/* Name field - NOW SECOND */}
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  {t("testimonials.modal_name_label")}
                </label>
                <input
                  type="text"
                  placeholder={t("testimonials.modal_name_placeholder")}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-darkGold rounded-xl bg-oxfordBlue/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darkGold"
                  required
                />
              </div>

              {/* Testimonial text with character counter - NOW THIRD */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-white font-medium">
                    {t("testimonials.modal_testimonial_label")}
                  </label>
                  <span
                    className={`text-xs md:text-base ${
                      quote.length > 110 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {quote.length}/110
                  </span>
                </div>
                <textarea
                  placeholder={t("testimonials.modal_testimonial_placeholder")}
                  maxLength={110}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-darkGold rounded-xl bg-oxfordBlue/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darkGold h-28 resize-none"
                  required
                />
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="px-4 pb-4 flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-darkGold text-darkGold rounded-lg hover:bg-darkGold/10 transition"
              >
                {t("testimonials.modal_cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !author.trim() ||
                  !quote.trim() ||
                  !imageFile ||
                  quote.length > 110
                }
                className={`px-3 py-2 bg-darkGold text-black font-bold rounded-lg ${
                  submitting ||
                  !author.trim() ||
                  !quote.trim() ||
                  !imageFile ||
                  quote.length > 110
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-opacity-90"
                } transition`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("testimonials.modal_submitting")}
                  </div>
                ) : (
                  t("testimonials.modal_submit")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Testimonials;