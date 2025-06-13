// components/Hero.js with i18n
import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Import the hook
import heroImage from "../../assets/img/Pessoas/Daniel.jpg";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";
import DaGalow from "../../assets/logos/DaGalow Logo.svg";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useContext } from "react";

function Hero() {
  const { t } = useTranslation(); // Use translation hook
  const { setService, setServiceWithTier } = useContext(ServiceContext);
  const [selectedTier, setSelectedTier] = useState(null); // Default to Basic tier

  const scrollTo = (id, duration = 50) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerHeight = 56;
    const targetY = el.offsetTop - headerHeight;
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    function animateScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * progress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  };

  const openForm = (service) => {
    setService(service); // ① tell the form which one
    document // ② smooth scroll
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" }); // MDN example :contentReference[oaicite:2]{index=2}
  };

 

  const handleOpenForm = (service) => (e) => {
    // button action
    e.stopPropagation(); // ⛔ keep it inside the button
    openForm(service); // your helper from before
  };

  /* parent scrolls to the section */
 // In Hero.jsx
const handleCardScroll = () => scrollTo("services", 100);
const handleCoachingCard = () => scrollTo("coaching", 100);
const handlePitchDeckCardScroll = () => scrollTo("venture-investment", 100);

    // New handler for Pitch Deck form opening
  const openPitchDeckForm = (e) => { // MODIFIED
    e.stopPropagation();
    setService("pitchdeck"); // MODIFIED - set service to"pitchdeck"
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const openCoachingForm = (e) => {
    e.stopPropagation(); // Stop event from bubbling to parent
    setServiceWithTier("coaching", selectedTier);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTierSelect = (e, tier) => {
    e.stopPropagation(); // Stop event from bubbling to parent elements
    setSelectedTier(tier);
  };

  return (
    <section
      id="hero"
      className="p-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-center md:py-4 lg:py-2 space-x-2">
        <h1 className="text-lg md:text-3xl font-extrabold">
          {t("hero.learn_from")}
        </h1>
        <img src={DaGalow} alt="DaGalow" className="w-[150px] md:w-[275px]" />
      </div>

      <div className="w-full h-full max-w-3xl mx-auto text-center">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover rounded-xl my-4 shadow-lg"
        />
        {/* Auto Carousel of topics */}
        <div className="my-8 mx-auto md:text-2xl w-40 md:w-60 flex self-center justify-center items-center">
          <Marquee
            speed={70}
            gradient={true}
            gradientColor="#002147" // This should match your oxfordBlue color
            gradientWidth={40}
          >
            <div className="mx-10">{t("hero.carousel_money")}</div>
            <div className="mx-10">{t("hero.carousel_health")}</div>
            <div className="mx-10">{t("hero.carousel_relationships")}</div>
            <div className="mx-10">{t("hero.carousel_mindset")}</div>
            <div className="mx-10">{t("hero.carousel_social_media")}</div>
            <div className="mx-10">{t("hero.carousel_business")}</div>
          </Marquee>
        </div>

        {/* Hero text - now using translations */}
        <h1 className="text-2xl md:text-4xl font-extrabold my-8">
          {t("hero.hero_title")}
        </h1>
        <p className="text-lg md:text-2xl my-8 max-w-md mx-auto md:max-w-2xl">
          {t("hero.hero_description")}
        </p>

        {/* Achievements carousel using Swiper - we'll keep the achievement text as is since they're specific data points */}
        <div className="my-14 ">
          <Swiper
            spaceBetween={40}
            slidesPerView={1.5}
            breakpoints={{
              200: {
                slidesPerView: 1.2,
              },
              400: {
                spaceBetween: 60,
                slidesPerView: 1.5,
              },
              1000: {
                spaceBetween: 60,
                slidesPerView: 2,
              },
            }}
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
            loopAdditionalSlides={5}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
            className="w-full overflow-visible mx-auto max-w-[800px] md:w-full px-10 md:px-20"
          >
            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_1_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_1_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_2_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_2_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_3_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_3_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_4_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_4_description")}
                </div>
              </div>
            </SwiperSlide>

            {/* Your other achievements */}
            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_5_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_5_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_6_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_6_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_7_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_7_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_8_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_8_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_9_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_9_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_10_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_10_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_11_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_11_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_12_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_12_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_13_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_13_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_14_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_14_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_15_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_15_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_16_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_16_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_17_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_17_description")}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div
          onClick={handleCardScroll}
          className="flex flex-col items-center justify-center mt-12 border-2 border-darkGold rounded-xl p-4"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("hero.hero_individual_consultation")}
              </h2>
              <p className="text-3xl md:text-4xl font-extrabold mb-2">
                {t("hero.hero_individual_consultation_price")}
              </p>
              <p className="text-sm md:text-lg font-normal mb-2">
                {t("hero.hero_individual_consultation_minimum_time")}
              </p>
            </div>
            <button
              onClick={handleOpenForm("booking")} // ← booking = consultations
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-75 z-10"
            >
              {t("hero.hero_book_consultation")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {t("hero.common_learn_more")}
            </p>
          </div>
        </div>

        {/* Direct Coaching */}
        <div
          onClick={handleCoachingCard}
          className="flex flex-col items-center justify-center mt-8 border-2 border-darkGold rounded-xl p-4"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("hero.hero_coaching_title")}
              </h2>

              <div className="flex space-x-2 md:space-x-4 mb-4">
                {/* Basic Tier */}
                <div
                  onClick={(e) => handleTierSelect(e, "Weekly")}
                  className={`w-20 md:w-32 h-18 md:h-24 border-2 border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-100 ${
                    selectedTier === "Weekly" ? "transform scale-110 z-10" : ""
                  }`}
                >
                  <span className="text-[16px] md:text-2xl font-extrabold">
                    40€
                  </span>
                  <span className="text-xs md:text-lg">
                    {t("hero.hero_coaching_basic")}
                  </span>
                </div>

                {/* Standard Tier */}
                <div
                  onClick={(e) => handleTierSelect(e, "Daily")}
                  className={`w-20 md:w-32 h-18 md:h-24 border-2 border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-100 ${
                    selectedTier === "Daily" ? "transform scale-110 z-10" : ""
                  }`}
                >
                  <span className="text-[16px] md:text-2xl font-extrabold">
                    90€
                  </span>
                  <span className="text-xs md:text-lg">
                    {t("hero.hero_coaching_standard")}
                  </span>
                </div>

                {/* Premium Tier */}
                <div
                  onClick={(e) => handleTierSelect(e, "Priority")}
                  className={`w-20 md:w-32 h-20 md:h-24 border-2 border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-100 ${
                    selectedTier === "Priority"
                      ? "transform scale-110 z-10"
                      : ""
                  }`}
                >
                  <span className="text-[16px] md:text-2xl font-extrabold">
                    230€
                  </span>
                  <span className="text-xs md:text-lg">
                    {t("hero.hero_coaching_premium")}
                  </span>
                </div>
              </div>

              <p className="text-sm md:text-md font-normal mb-2">
                {t("hero.hero_coaching_limited_spots")}
              </p>
            </div>

            <button
              onClick={openCoachingForm}
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-75 z-10"
            >
              {t("hero.hero_get_my_number")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {t("hero.common_learn_more")}
            </p>
          </div>
        </div>

        {/* Pitch Deck */}
        <div
          onClick={handlePitchDeckCardScroll} // MODIFIED
          className="flex flex-col items-center justify-center mt-8 border-2 border-darkGold rounded-xl p-4"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("hero.hero_pitchdeck_title")}
              </h2>

              <p className="text-sm md:text-md font-normal mb-2">
                {t("hero.hero_pitchdeck_description")}
              </p>
            </div>

            <button
              onClick={openPitchDeckForm} // MODIFIED
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-75 z-10"
            >
              {t("hero.hero_pitchdeck_button")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {t("hero.common_learn_more")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;