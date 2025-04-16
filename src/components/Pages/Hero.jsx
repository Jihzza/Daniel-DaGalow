// components/Hero.js
import React from "react";
import heroImage from "../../assets/Dani.jpeg";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";

function Hero() {
  return (
    <section
      id="hero"
      className="py-2 px-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      <div className="w-full h-full max-w-3xl mx-auto text-center">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover rounded-xl my-8 shadow-lg"
        />
        <div className="my-8 w-full flex justify-center items-center">
          <Marquee
            speed={70}
            gradient={true}
            gradientColor="#002147" // This should match your oxfordBlue color
            gradientWidth={40}
            className="w-40"
          >
            <div className="mx-10">Money</div>
            <div className="mx-10">Health</div>
            <div className="mx-10">Relationships</div>
            <div className="mx-10">Mindset</div>
            <div className="mx-10">Social Media</div>
            <div className="mx-10">Business</div>
          </Marquee>
        </div>
        <h1 className="text-3xl font-extrabold my-8">
          I Help You Master Mindset, Money, and More – Without the Boring Stuff.
        </h1>
        <p className="text-lg md:text-xl my-8 max-w-md mx-auto">
          Tired of spinning your wheels? I've built million‑dollar businesses,
          transformed my life, and I'm here to help you do it too—with humor and
          real talk.
        </p>
        <div className="my-14">
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

        <div className="flex flex-col items-center justify-center space-y-6 mt-16 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center space-y-6 my-8">
            <h2 className="text-3xl font-bold">Indivual Consultation</h2>
            <p className="text-3xl font-extrabold">$120 / hour</p>
            <a
              href="#booking"
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg"
            >
              Book a Consultation
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6 my-8 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center space-y-6 my-8">
            <h2 className="text-3xl font-bold">Illimited Access</h2>
            <p className="text-3xl font-extrabold">$150 / month</p>
            <a
              href="#coaching-request"
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg"
            >
              Get My Number
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6 my-8 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center space-y-6 my-8">
            <h2 className="text-3xl font-bold">Expert Analysis</h2>
            <p className="text-lg font-normal">
              A stock you're interested - Your entire portfolio - Your social
              media - Your business
            </p>
            <a
              href="#coaching-request"
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg"
            >
              See Options
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
