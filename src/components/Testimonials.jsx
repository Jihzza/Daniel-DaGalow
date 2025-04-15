// components/Testimonials.js
import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      quote: "John’s advice skyrocketed my business — his coaching is the real deal.",
      author: "Jane D., Startup Founder"
    },
    {
      quote: "I transformed not only my body, but also my mindset. Truly life-changing!",
      author: "Mike S., Entrepreneur"
    },
    // Add more testimonials here as needed…
  ];

  return (
    <section id="testimonials" className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Success Stories
        </h2>
        <div className="space-y-8">
          {testimonials.map((t, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded shadow">
              <p className="italic mb-2">"{t.quote}"</p>
              <p className="font-semibold">— {t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
