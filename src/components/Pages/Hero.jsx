// components/Hero.js
import React from "react";
import heroImage from "../../assets/Dani.jpeg";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";

function Hero() {
  return (
    <section
      id="hero"
      className="py-16 px-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      <div className="w-full h-full max-w-3xl mx-auto text-center">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover rounded-xl my-8 shadow-lg"
        />
        <h1 className="text-3xl font-extrabold mb-8">
          I Help You Master Mindset, Money, and More – Without the Boring Stuff.
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-md mx-auto">
          Tired of spinning your wheels? I've built million‑dollar businesses,
          transformed my life, and I'm here to help you do it too—with humor and
          real talk.
        </p>
        <div className="mb-8">
          {/* Achievements carousel using Swiper */}
          <Swiper
            spaceBetween={20}
            slidesPerView={2}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
            className="w-full overflow-visible"
          >
            <SwiperSlide>
              <div className="p-2 bg-charcoalGray rounded-lg shadow-lg">
                <span className="font-extrabold text-lg">$150K+</span>
                <div className="text-lg">in revenue</div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="p-2 bg-charcoalGray rounded-lg shadow-lg">
                <span className="font-extrabold text-lg">Top 1%</span>
                <div className="text-lg">on OnlyFans</div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="p-2 bg-charcoalGray rounded-lg shadow-lg">
                <span className="font-extrabold text-lg">200K+</span>
                <div className="text-lg">social views</div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="p-2 bg-charcoalGray rounded-lg shadow-lg">
                <span className="font-extrabold text-lg">3 Months</span>
                <div className="text-lg">body transformed</div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6 mb-8">
          <h2 className="text-lg">Indivual Consultation</h2>
          <p className="text-3xl font-extrabold">$120 / hour</p>
        </div>
        <a
          href="#booking"
          className="bg-darkGold text-black font-bold px-6 py-3 rounded-lg shadow-lg"
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
}

export default Hero;
