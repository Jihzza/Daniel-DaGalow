// components/Pages/Testimonials.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import test from "../../assets/Dani.jpeg";
import bodyTransformation from "../../assets/Body Transformation.mp4";
import tiktok1 from "../../assets/img/Tiktok/TikTok1.png";
import tiktok2 from "../../assets/img/Tiktok/TikTok2.png";
import tiktok3 from "../../assets/img/Tiktok/TikTok3.png";
import tiktok4 from "../../assets/img/Tiktok/TikTok4.png";
import tiktok5 from "../../assets/img/Tiktok/TikTok5.png";
import tiktok6 from "../../assets/img/Tiktok/TikTok6.png";
import tiktok7 from "../../assets/img/Tiktok/TikTok7.png";
import tiktok8 from "../../assets/img/Tiktok/TikTok8.png";
import tiktok9 from "../../assets/img/Tiktok/TikTok9.png";
import tiktok10 from "../../assets/img/Tiktok/TikTok10.png";
import tiktok11 from "../../assets/img/Tiktok/TikTok11.png";
import tiktok12 from "../../assets/img/Tiktok/TikTok12.png";
import tiktok13 from "../../assets/img/Tiktok/TikTok13.png";
import tiktok14 from "../../assets/img/Tiktok/TikTok14.png";
import tiktok15 from "../../assets/img/Tiktok/TikTok15.png";
import tiktok16 from "../../assets/img/Tiktok/TikTok16.png";
import tiktok17 from "../../assets/img/Tiktok/TikTok17.png";
import tiktok18 from "../../assets/img/Tiktok/TikTok18.png";
import tiktok19 from "../../assets/img/Tiktok/TikTok19.png";
import tiktok20 from "../../assets/img/Tiktok/TikTok20.png";
import twitter1 from "../../assets/img/Twitter/Twitter1.png";
import twitter2 from "../../assets/img/Twitter/Twitter2.png";
import twitter3 from "../../assets/img/Twitter/Twitter3.png";
import twitter4 from "../../assets/img/Twitter/Twitter4.png";
import twitter5 from "../../assets/img/Twitter/Twitter5.png";
import twitter6 from "../../assets/img/Twitter/Twitter6.png";
import twitter7 from "../../assets/img/Twitter/Twitter7.png";
import twitter8 from "../../assets/img/Twitter/Twitter8.png";
import twitter9 from "../../assets/img/Twitter/Twitter9.png";
import twitter10 from "../../assets/img/Twitter/Twitter10.png";
import twitter11 from "../../assets/img/Twitter/Twitter11.png";
import twitter12 from "../../assets/img/Twitter/Twitter12.png";
import twitter13 from "../../assets/img/Twitter/Twitter13.png";
import twitter14 from "../../assets/img/Twitter/Twitter14.png";
import twitter15 from "../../assets/img/Twitter/Twitter15.png";
import twitter16 from "../../assets/img/Twitter/Twitter16.png";
import twitter17 from "../../assets/img/Twitter/Twitter17.png";
import twitter18 from "../../assets/img/Twitter/Twitter18.png";
import twitter19 from "../../assets/img/Twitter/Twitter19.png";
import twitter20 from "../../assets/img/Twitter/Twitter20.png";
import twitter21 from "../../assets/img/Twitter/Twitter21.png";
import twitter22 from "../../assets/img/Twitter/Twitter22.png";
import twitter23 from "../../assets/img/Twitter/Twitter23.png";
import twitter24 from "../../assets/img/Twitter/Twitter24.png";
import twitter25 from "../../assets/img/Twitter/Twitter25.png";
import twitter26 from "../../assets/img/Twitter/Twitter26.png";
import twitter27 from "../../assets/img/Twitter/Twitter27.png";
import twitter28 from "../../assets/img/Twitter/Twitter28.png";
import twitter29 from "../../assets/img/Twitter/Twitter29.png";
import twitter30 from "../../assets/img/Twitter/Twitter30.png"; 
import twitter31 from "../../assets/img/Twitter/Twitter31.png";
import twitter32 from "../../assets/img/Twitter/Twitter32.png";
import twitter33 from "../../assets/img/Twitter/Twitter33.png";
import twitter34 from "../../assets/img/Twitter/Twitter34.png";
import twitter35 from "../../assets/img/Twitter/Twitter35.png";
import twitter36 from "../../assets/img/Twitter/Twitter36.png";
import twitter37 from "../../assets/img/Twitter/Twitter37.png";



const tiktokImages = [
  tiktok1, tiktok2, tiktok3, tiktok4, tiktok5, tiktok6, tiktok7, tiktok8, tiktok9, tiktok10,
  tiktok11, tiktok12, tiktok13, tiktok14, tiktok15, tiktok16, tiktok17, tiktok18, tiktok19, tiktok20
];

const twitterImages = [
  twitter1, twitter2, twitter3, twitter4, twitter5, twitter6, twitter7, twitter8, twitter9, twitter10,
  twitter11, twitter12, twitter13, twitter14, twitter15, twitter16, twitter17, twitter18, twitter19, twitter20,
  twitter21, twitter22, twitter23, twitter24, twitter25, twitter26, twitter27, twitter28, twitter29, twitter30,
  twitter31, twitter32, twitter33, twitter34, twitter35, twitter36, twitter37
];

function Testimonials() {
  const handleDoubleClick = (event) => {
    const video = event.target;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      // Safari
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      // IE11
      video.msRequestFullscreen();
    }
  };

  const testimonials = [
    {
      quote:
        "Daniel's advice skyrocketed my business — his coaching is the real deal.",
      author: "Jane D.",
      title: "Startup Founder",
      image: test, // Replace with actual image paths
    },
    {
      quote:
        "I transformed not only my body, but also my mindset. Truly life-changing!",
      author: "Mike S.",
      title: "Entrepreneur",
      image: test,
    },
    {
      quote:
        "Working with Daniel helped me increase revenue by 40% in just two months.",
      author: "Sophia R.",
      title: "Marketing Director",
      image: test,
    },
    {
      quote:
        "From struggling to six figures in my first year thanks to Daniel's framework.",
      author: "James M.",
      title: "Fitness Brand Owner",
      image: test,
    },
  ];

  return (
    <section id="testimonials" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-8 px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold">Success Stories</h2>

        <Swiper
          modules={[Autoplay]}
          centeredSlides={true}
          slidesPerView={1.2}
          spaceBetween={20}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="testimonial-swiper overflow-visible"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white w-full h-full p-4 rounded-lg shadow-md flex flex-col justify-center items-center mx-auto">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-darkGold mb-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = test;
                  }}
                />

                <p className="italic mb-6 text-lg">"{testimonial.quote}"</p>

                <div className="font-semibold mb-2">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.title}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex flex-col justify-center space-y-6 items-center">
          <h1 className="text-2xl text-white font-bold">Other Wins</h1>
          <p className="text-lg text-white">69 Days Body Transformation</p>
          {/*Double click to go back to normal size*/}
          <video
            src={bodyTransformation}
            autoPlay
            muted
            loop
            onDoubleClick={handleDoubleClick}
            className="w-[50%] object-cover rounded-xl shadow-lg justify-center items-center self-center cursor-pointer"
          />
          <p className="text-lg text-white">High reach content</p>
          <Swiper
            spaceBetween={40}
            slidesPerView={1}
            centeredSlides={true}
            pagination={{ clickable: true }}
            // autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            className="w-full overflow-visible mx-auto "
          >
            {tiktokImages.map((tiktok, index) => (
              <SwiperSlide key={index}>
              <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={tiktok}
                  alt={`TikTok Content ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
            </SwiperSlide>
            
            ))}
            {twitterImages.map((twitter, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={twitter}
                    alt={`Twitter Content ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
