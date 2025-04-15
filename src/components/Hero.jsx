// components/Hero.js
import React from 'react';

function Hero() {
  return (
    <section id="hero" className="bg-oxfordBlue text-white min-h-screen flex flex-col 
                                   justify-center items-center text-center px-4">
      {/* Adjust background image or color as needed */}
      <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
        I Help You Master Mindset, Money, and More – Without the Boring Stuff.
      </h1>
      <p className="text-lg md:text-xl mb-6 max-w-md">
        Tired of spinning your wheels? I’ve built million‑dollar businesses,
        transformed my life, and I’m here to help you do it too—with humor and real talk.
      </p>
      {/* Achievements snapshot as a horizontal list/carousel */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="p-2 bg-charcoalGray rounded">
          <span className="font-bold text-xl">$150K+</span>
          <div className="text-sm">in revenue</div>
        </div>
        <div className="p-2 bg-charcoalGray rounded">
          <span className="font-bold text-xl">Top 1%</span>
          <div className="text-sm">on OnlyFans</div>
        </div>
        <div className="p-2 bg-charcoalGray rounded">
          <span className="font-bold text-xl">200K+</span>
          <div className="text-sm">social views</div>
        </div>
        <div className="p-2 bg-charcoalGray rounded">
          <span className="font-bold text-xl">3 Months</span>
          <div className="text-sm">body transformed</div>
        </div>
      </div>
      <a 
        href="#booking" 
        className="bg-darkGold hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded"
      >
        Book a Consultation
      </a>
    </section>
  );
}

export default Hero;
