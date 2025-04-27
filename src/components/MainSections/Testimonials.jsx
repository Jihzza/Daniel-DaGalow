// src/components/Pages/Testimonials.jsx

import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useAuth } from "../contexts/AuthContext";

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

function Testimonials({ onAuthModalOpen }) {
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

  // In the useEffect that fetches testimonials

  useEffect(() => {
    // Initial fetch of approved testimonials
    fetchApprovedTestimonials();
    
    // Set up a real-time subscription to testimonials changes
    const subscription = supabase
      .channel('testimonials-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'testimonials' }, 
        payload => {
          console.log('Testimonial updated:', payload);
          // If a testimonial was updated to 'approved' status, refresh the list
          if (payload.new.status === 'approved') {
            console.log('Approved testimonial detected, refreshing list');
            fetchApprovedTestimonials();
          }
        })
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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
    const processedData = data.map(item => ({
      ...item,
      image_url: item.image_url.startsWith('http') 
        ? item.image_url 
        : `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/testimonials/${item.image_url}`
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
      alert("Please fill out all fields and select an image.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit a testimonial.");
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
      alert(
        "Thank you! Your testimonial has been submitted and is pending review."
      );
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold">Success Stories</h2>
        <p className="text-lg">
          Here are some reviews — and if I’ve helped you, please leave one so we
          can inspire even more people.
        </p>

        {/* leave static + dynamic */}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <Swiper
            modules={[Autoplay]}
            centeredSlides // keep the active slide in the middle
            slidesPerView={1.5} // let card width decide how many fit
            spaceBetween={100} // gap between cards
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="testimonial-swiper overflow-visible"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div
                  className="
                  bg-white
                  w-56           
                  h-72           
                  p-4
                  rounded-lg
                  shadow-md
                  flex
                  flex-col
                  items-center  /* center horizontally */
                  justify-center/* center vertically */
                  text-center   /* center text inside */
                  overflow-hidden
                  text-base
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
                  <div className="mt-4 font-semibold">{testimonial.author}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <button
          onClick={handleTestimonialButtonClick}
          className="px-6 py-3 bg-darkGold text-black font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
        >
          Leave a Testimonial
        </button>
      </div>

      {/* Modal with updated layout order */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-oxfordBlue rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-fade-in">
            <div className="border-b border-darkGold/30 p-4">
              <h3 className="text-2xl font-bold text-white mb-1">
                Share Your Experience
              </h3>
              <p className="text-gray-300 text-sm">
                Let others know how Daniel helped you
              </p>
            </div>

            <div className="p-4 space-y-6">
              {/* Image upload with preview - NOW FIRST */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  Your Photo
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
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs"
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
                      {imageFile ? "Change Photo" : "Select Photo"}
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
                  <p className="text-gray-400 text-xs text-center">
                    Please upload a photo of yourself for your testimonial
                  </p>
                )}
              </div>

              {/* Name field - NOW SECOND */}
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
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
                    Your Testimonial
                  </label>
                  <span
                    className={`text-xs ${
                      quote.length > 110 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {quote.length}/110
                  </span>
                </div>
                <textarea
                  placeholder="Share how Daniel helped you..."
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
                Cancel
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
                    Submitting...
                  </div>
                ) : (
                  "Submit"
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
