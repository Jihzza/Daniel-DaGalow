// components/Hero.js
import React from "react";
import heroImage from "../../assets/Dani.jpeg";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";
import { useNavigate } from "react-router-dom";
import DaGalow from "../../assets/DaGalow Logo.svg";
function Hero() {
  const navigate = useNavigate();
  const handleServiceClick = (service) => {
    const mapping = {
      booking: "#booking",
      coaching: "#coaching-journey",
      analysis: "#analysis-request",
    };
    navigate(`/?service=${service}${mapping[service]}`);
    setTimeout(() => {
      const id = mapping[service].slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  return (
    <section
      id="hero"
      className="pb-8 pt-4 px-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      <div className="flex items-center justify-center space-x-2">
        <h1 className="text-lg font-extrabold">Learn from</h1>
        <img src={DaGalow} alt="DaGalow" className="w-[150px]" />
      </div>

      <div className="w-full h-full max-w-3xl mx-auto text-center">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover rounded-xl my-4 shadow-lg"
        />
        <div className="my-8 mx-auto w-40 flex self-center justify-center items-center">
          <Marquee
            speed={70}
            gradient={true}
            gradientColor="#002147" // This should match your oxfordBlue color
            gradientWidth={40}
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
        <div className="my-14 ">
          {/* Achievements carousel using Swiper */}
          <Swiper
            spaceBetween={40}
            slidesPerView={1.5}
            breakpoints={
              {
                200: {
                  slidesPerView: 1.2,
                },
                400: {
                  slidesPerView: 1.5,
                }
              }
            }
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
            className="w-full overflow-visible mx-auto max-w-[800px] px-10"
          >
            {/* Remade original examples. 246w 180h */}
            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">$140K+ / year</span>
                <div className="text-lg">revenue for my company</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">Top 1% Earner</span>
                <div className="text-lg">on OnlyFans Worldwide</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">200K+</span>
                <div className="text-lg">
                  social media views on multiple videos
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">69 days</span>
                <div className="text-lg">complete body transformation</div>
              </div>
            </SwiperSlide>

            {/* Your other achievements */}
            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">4 Countries</span>
                <div className="text-lg">lived in multiple nations</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">Addiction</span>
                <div className="text-lg">beat it on my own</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">Depression</span>
                <div className="text-lg">
                  overcame by myself without medicine
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">6+ Languages</span>
                <div className="text-lg">fluent in multiple tongues</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">100K+ Views</span>
                <div className="text-lg">
                  content reaching 100's of thousands
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">Miss Portugal</span>
                <div className="text-lg">managed the 2019/2020 champion</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">$10K+ Monthly</span>
                <div className="text-lg">
                  helped clients achieve financial freedom
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">+10 years</span>
                <div className="text-lg">of stock market experience</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                  Thousands of stocks
                </span>
                <div className="text-lg">
                  researched through fundamental analysis
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">8 Years</span>
                <div className="text-lg">
                  in a stable long-term relationship
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                  0 to 60K+ Followers
                </span>
                <div className="text-lg">
                  grew clients on multiple platforms
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">
                  10's of thousands
                </span>
                <div className="text-lg">of hours researching fundamental topics</div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[206px] h-[120px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4">
                <span className="font-extrabold text-lg">Age 13</span>
                <div className="text-lg">website reached 60K+ users</div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div role="button" onClick={() => handleServiceClick("booking")} className="flex flex-col items-center justify-center mt-16 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center py-6 justify-center">
              <h2 className="text-3xl font-bold mb-6">
                Individual Consultation
              </h2>
              <p className="text-3xl font-extrabold mb-2">$90 / hour</p>
              <p className="text-sm font-normal mb-2">Minimum 45 minutes</p>
            </div>
            <button
              onClick={() => handleServiceClick("booking")}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Book a Consultation
            </button>
            <p role="button" onClick={() => handleServiceClick("booking")} className="text-sm font-normal">Learn More</p>
          </div>
        </div>
        <div role="button" onClick={() => handleServiceClick("coaching")} className="flex flex-col items-center justify-center mt-8 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold mb-6">Direct Coaching</h2>
              <p className="text-3xl font-extrabold mb-2">$150 / month</p>
              <p className="text-sm font-normal mb-2">Limited Spots</p>
            </div>
            <button
              onClick={() => handleServiceClick("coaching")}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Get My Number
            </button>
            <p role="button" onClick={() => handleServiceClick("coaching")} className="text-sm font-normal">Learn More</p>
          </div>
        </div>

        <div role="button" onClick={() => handleServiceClick("analysis")} className="flex flex-col items-center justify-center space-y-6 mt-8 border-2 border-darkGold rounded-xl p-4">
          <div className="flex flex-col items-center justify-center my-8">
            <h2 className="text-3xl font-bold mb-6">Expert Analysis</h2>
            <p className="text-lg font-normal mb-8">
              A stock you're interested - Your entire portfolio - Your social
              media - Your business
            </p>
            <button
              onClick={() => handleServiceClick("analysis")}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Get My Analysis
            </button>
            <p role="button" onClick={() => handleServiceClick("analysis")} className="text-sm font-normal">Learn More</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
