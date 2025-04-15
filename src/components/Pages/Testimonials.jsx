// components/Pages/Testimonials.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import test from "../../assets/Dani.jpeg";

function Testimonials() {
  const testimonials = [
    {
      quote: "Daniel's advice skyrocketed my business — his coaching is the real deal.",
      author: "Jane D.",
      title: "Startup Founder",
      image: test // Replace with actual image paths
    },
    {
      quote: "I transformed not only my body, but also my mindset. Truly life-changing!",
      author: "Mike S.",
      title: "Entrepreneur",
      image: test
    },
    {
      quote: "Working with Daniel helped me increase revenue by 40% in just two months.",
      author: "Sophia R.",
      title: "Marketing Director",
      image: test
    },
    {
      quote: "From struggling to six figures in my first year thanks to Daniel's framework.",
      author: "James M.",
      title: "Fitness Brand Owner",
      image: test
    }
  ];

  return (
    <section id="testimonials" className="py-16 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Success Stories
        </h2>

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
              <div className="bg-white w-full h-80 p-4 rounded-lg shadow-md flex flex-col justify-center items-center mx-auto">
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
      </div>

    </section>
  );
}

export default Testimonials;