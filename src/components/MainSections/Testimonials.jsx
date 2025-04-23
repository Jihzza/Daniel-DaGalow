// src/components/Pages/Testimonials.jsx

import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// bring in your original assets
import rafaelImg from "../../assets/img/Pessoas/Rafa.jpeg";
import goncaloImg from "../../assets/img/Pessoas/Gonçalo.png";

const defaultTestimonials = [
  {
    id: "static-1",
    quote:
      "I've learned directly from Daniel for two years, moving from poverty and isolation to skill and confidence.",
    author: "Rafael M.",
    image_url: rafaelImg,
  },
  {
    id: "static-2",
    quote:
      "Seven years following Daniel online, one year abroad learning directly—best decision of my life.",
    author: "Gonçalo M.",
    image_url: goncaloImg,
  },
  {
    id: "static-3",
    quote:
      "I've learned directly from Daniel for two years, moving from poverty and isolation to skill and confidence.",
    author: "Rafael M.",
    image_url: rafaelImg,
  },
  {
    id: "static-4",
    quote:
      "Seven years following Daniel online, one year abroad learning directly—best decision of my life.",
    author: "Gonçalo M.",
    image_url: goncaloImg,
  },
];

function Testimonials() {
  // start with your default ones
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [loading, setLoading]         = useState(true);

  // Modal & form state
  const [isModalOpen, setModalOpen]   = useState(false);
  const [author, setAuthor]           = useState("");
  const [quote, setQuote]             = useState("");
  const [imageFile, setImageFile]     = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  // Fetch dynamic testimonials and prepend them
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading testimonials:", error);
      } else {
        // merge: dynamic ones first, then static defaults
        setTestimonials([
          ...data.map(t => ({ ...t, image_url: t.image_url })), 
          ...defaultTestimonials
        ]);
      }
      setLoading(false);
    })();
  }, []);

  // handle new submission
  const handleSubmit = async () => {
    if (!author.trim() || !quote.trim() || !imageFile) {
      alert("Please fill out all fields and select an image.");
      return;
    }
    setSubmitting(true);

    try {
      // upload image
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      let { error: upErr } = await supabase
        .storage
        .from("testimonials")
        .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      // get URL
      let { data: urlData, error: urlErr } = supabase
        .storage
        .from("testimonials")
        .getPublicUrl(fileName);
      if (urlErr) throw urlErr;

      // insert record
      let { data: newT, error: insErr } = await supabase
        .from("testimonials")
        .insert({
          author: author.trim(),
          quote: quote.trim(),
          image_url: urlData.publicUrl,
        })
        .single();
      if (insErr) throw insErr;

      // update state: put new one at top
      setTestimonials(prev => [newT, ...prev]);
      setModalOpen(false);
      setAuthor(""); setQuote(""); setImageFile(null);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold">Success Stories</h2>
        <p className="text-lg">
          Here are some reviews — and if I’ve helped you, please leave one so we can inspire even more people.
        </p>

        {/* leave static + dynamic */}
        <button
          onClick={() => setModalOpen(true)}
          className="!mb-2 px-6 py-3 bg-darkGold text-black font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
        >
          Leave a Testimonial
        </button>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <Swiper
            modules={[Autoplay]}
            centeredSlides
            slidesPerView={1.2}
            spaceBetween={20}
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="testimonial-swiper overflow-visible"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
              <div
                className="
                  bg-white
                  w-72           
                  h-60           
                  p-4
                  rounded-lg
                  shadow-md
                  flex
                  flex-col
                  items-center  /* center horizontally */
                  justify-center/* center vertically */
                  text-center   /* center text inside */
                  overflow-hidden
                "
              >
                {/* Avatar */}
                <img
                  src={testimonial.image_url}
                  alt={testimonial.author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-darkGold mb-4"
                />
            
                {/* Quote: allow internal scroll if needed */}
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <p className="italic text-md px-2">"{testimonial.quote}"</p>
                </div>
            
                {/* Author */}
                <div className="mt-4 font-semibold">
                  {testimonial.author}
                </div>
              </div>
            </SwiperSlide>
            
            ))}
          </Swiper>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-oxfordBlue p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Your Testimonial</h3>
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full mb-4 p-3 border-2 border-darkGold rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-darkGold"
            />
            <textarea
              placeholder="Your message (max 110 chars)"
              maxLength={110}
              value={quote}
              onChange={e => setQuote(e.target.value)}
              className="w-full mb-4 p-3 border-2 border-darkGold rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-darkGold h-28 resize-none"
            />
            {/* styled file-picker */}
            <div className="mb-6">
              <label 
                className="inline-flex items-center px-4 py-2 bg-darkGold text-black font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition duration-300 cursor-pointer"
              >
                {imageFile ? imageFile.name : "Choose Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 border-2 border-darkGold text-white rounded-lg shadow hover:bg-darkGold hover:text-black transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-darkGold text-black font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Testimonials;
