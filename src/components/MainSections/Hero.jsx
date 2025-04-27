// components/Hero.js with i18n
import React from "react";
import { useTranslation } from 'react-i18next'; // Import the hook
import heroImage from "../../assets/img/Pessoas/Daniel.jpg";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";
import DaGalow from "../../assets/logos/DaGalow Logo.svg";
import { ServiceContext } from "../contexts/ServiceContext";
import { useContext } from "react";


function Hero() {
const { t } = useTranslation(); // Use translation hook

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // Calculate the header height (14 is the h-14 in your header)
      const headerHeight = 56; // 14 * 4 = 56px
      
      // Scroll with an offset to account for the header
      window.scrollTo({
        top: el.offsetTop - headerHeight,
        behavior: 'smooth'
      });
    }
  };

  const { setService } = useContext(ServiceContext);

  const openForm = (service) => {
    setService(service); // ① tell the form which one
    document // ② smooth scroll
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" }); // MDN example :contentReference[oaicite:2]{index=2}
  };

  const handleCardScroll = () => scrollTo("services"); // parent scroll

  const handleOpenForm = (service) => (e) => {
    // button action
    e.stopPropagation(); // ⛔ keep it inside the button
    openForm(service); // your helper from before
  };

  /* parent scrolls to the section */
const handleCoachingCard = () => scrollTo("coaching");
/* button opens the Coaching wizard */
const openCoachingForm  = (e) => {
  e.stopPropagation();          // stop bubbling here
  openForm("coaching");
};

const handleAnalysisCard = () => scrollTo("expert-analysis");
const openAnalysisForm   = (e) => {
  e.stopPropagation();
  openForm("analysis");
};

  return (
<section
      id="hero"
      className="pb-8 pt-4 px-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2">
        <h1 className="text-lg font-extrabold">{t('hero.learn_from')}</h1>
        <img src={DaGalow} alt="DaGalow" className="w-[150px]" />
      </div>

      <div className="w-full h-full max-w-3xl mx-auto text-center">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover rounded-xl my-4 shadow-lg"
        />
        {/* Auto Carousel of topics */}
        <div className="my-8 mx-auto w-40 flex self-center justify-center items-center">
          <Marquee
            speed={70}
            gradient={true}
            gradientColor="#002147" // This should match your oxfordBlue color
            gradientWidth={40}
          >
            <div className="mx-10">{t('hero.carousel_money')}</div>
            <div className="mx-10">{t('hero.carousel_health')}</div>
            <div className="mx-10">{t('hero.carousel_relationships')}</div>
            <div className="mx-10">{t('hero.carousel_mindset')}</div>
            <div className="mx-10">{t('hero.carousel_social_media')}</div>
            <div className="mx-10">{t('hero.carousel_business')}</div>
          </Marquee>
        </div>

        {/* Hero text - now using translations */}
        <h1 className="text-2xl font-extrabold my-8">
          {t('hero.hero_title')}
        </h1>
        <p className="text-lg md:text-xl my-8 max-w-md mx-auto">
          {t('hero.hero_description')}
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
                slidesPerView: 1.5,
              },
            }}
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
            className="w-full overflow-visible mx-auto max-w-[800px] px-10"
          >
            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_1_title')}</span>
                <div className="text-lg">{t('hero.achievement_1_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_2_title')}</span>
                <div className="text-lg">{t('hero.achievement_2_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_3_title')}</span>
                <div className="text-lg">{t('hero.achievement_3_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_4_title')}</span>
                <div className="text-lg">{t('hero.achievement_4_description')}</div>
              </div>
            </SwiperSlide>

            {/* Your other achievements */}
            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_5_title')}</span>
                <div className="text-lg">{t('hero.achievement_5_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_6_title')}</span>
                <div className="text-lg">{t('hero.achievement_6_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_7_title')}</span>
                <div className="text-lg">{t('hero.achievement_7_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_8_title')}</span>
                <div className="text-lg">{t('hero.achievement_8_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_9_title')}</span>
                <div className="text-lg">{t('hero.achievement_9_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_10_title')}</span>
                <div className="text-lg">{t('hero.achievement_10_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_11_title')}</span>
                <div className="text-lg">{t('hero.achievement_11_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">{t('hero.achievement_12_title')}</span>
                <div className="text-lg">{t('hero.achievement_12_description')}</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                {t('hero.achievement_13_title')}
                </span>
                <div className="text-lg">
                {t('hero.achievement_13_description')}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                {t('hero.achievement_14_title')}
                </span>
                <div className="text-lg">
                {t('hero.achievement_14_description')}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                {t('hero.achievement_15_title')}
                </span>
                <div className="text-lg">
                {t('hero.achievement_15_description')}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                {t('hero.achievement_16_title')}
                </span>
                <div className="text-lg">
                {t('hero.achievement_16_description')}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                {t('hero.achievement_17_title')}
                </span>
                <div className="text-lg">
                {t('hero.achievement_17_description')}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div
          onClick={handleCardScroll}
          className="flex flex-col items-center justify-center mt-16 border-2 border-darkGold rounded-xl p-4"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold mb-6">
                {t('hero.hero_individual_consultation')}
              </h2>
              <p className="text-3xl font-extrabold mb-2">{t('hero.hero_individual_consultation_price')}</p>
              <p className="text-sm font-normal mb-2">{t('hero.hero_individual_consultation_minimum_time')}</p>
            </div>
            <button
              onClick={handleOpenForm("booking")} // ← booking = consultations
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t('hero.hero_book_consultation')}
            </button>
            <p role="button" className="text-sm font-normal">
              {t('hero.common_learn_more')}
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
              <h2 className="text-3xl font-bold mb-6">{t('hero.hero_coaching_title')}</h2>

              <div className="flex space-x-2 mb-4">
                <label className="w-20 h-18 border border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1">
                  <input
                    type="radio"
                    name="tier"
                    className="hidden"
                    defaultChecked
                  />
                  <span className="text-[16px] font-extrabold">40€</span>
                  <span className="text-xs">{t('hero.hero_coaching_basic')}</span>
                </label>
                <label className="w-20 h-18 border border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1">
                  <input type="radio" name="tier" className="hidden" />
                  <span className="text-[16px] font-extrabold">90€</span>
                  <span className="text-xs">{t('hero.hero_coaching_standard')}</span>
                </label>
                <label className="w-20 h-20 border border-darkGold rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1">
                  <input type="radio" name="tier" className="hidden" />
                  <span className="text-[16px] font-extrabold">230€</span>
                  <span className="text-xs">{t('hero.hero_coaching_premium')}</span>
                </label>
              </div>

              <p className="text-sm font-normal mb-2">{t('hero.hero_coaching_limited_spots')}</p>
            </div>

            <button
              onClick={openCoachingForm}
              className="bg-darkGold w-60 text-black font-bold text-[16px] px-6 py-3 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t('hero.hero_get_my_number')}
            </button>
            <p role="button" className="text-sm font-normal">
              {t('hero.common_learn_more')}
            </p>
          </div>
        </div>

        {/* Expert Analysis */}
        <div
          onClick={handleAnalysisCard}
          className="flex flex-col items-center justify-center space-y-6 mt-8 border-2 border-darkGold rounded-xl p-4"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <h2 className="text-3xl font-bold mb-6">{t('hero.hero_get_analysis_title')}</h2>
            <p className="text-lg font-normal mb-8">
              {t('hero.hero_get_analysis_description')}
            </p>
            <button
              onClick={openAnalysisForm}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t('hero.hero_get_my_analysis')}
            </button>
            <p role="button" className="text-sm font-normal">
              {t('hero.common_learn_more')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;