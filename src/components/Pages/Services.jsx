// components/Services.js
import React from 'react';

function Services() {
  return (
    <section id="services" className="py-16 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          How I Can Help You
        </h2>
        <p className="mb-8">
          Whether you need guidance on mindset, social media growth, finance, marketing, business building, or relationships – I cover it all.
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 text-black">
          {[
            { title: "Mindset & Psychology", icon: "🧠" },
            { title: "Social Media Growth", icon: "📱" },
            { title: "Finance & Wealth", icon: "💰" },
            { title: "Marketing & Sales", icon: "🎯" },
            { title: "Business Building", icon: "💼" },
            { title: "Relationships", icon: "❤️" }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-gray-100 rounded">
              <div className="text-3xl">{item.icon}</div>
              <div className="mt-2 font-semibold text-sm">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
