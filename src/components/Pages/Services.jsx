// components/Services.js
import React from 'react';
import Brain from '../../assets/Brain Branco.svg';
import Phone from '../../assets/Phone Branco.svg';
import MoneyBag from '../../assets/MoneyBag Branco.svg';
import Target from '../../assets/Target Branco.svg';
import Bag from '../../assets/Bag Branco.svg';
import Heart from '../../assets/Heart Branco.svg';
import OnlyFans from '../../assets/Onlyfans Branco.svg';
import Fitness from '../../assets/Fitness Branco.svg';

function Services() {
  return (
    <section id="services" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          How I Can Help You
        </h2>
        <p className="">
          Whether you need guidance on mindset, social media growth, finance, marketing, business building, or relationships – I cover it all.
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 text-white">
          {[
            { title: "Mindset & Psychology", icon: <img src={Brain} alt="Brain" className="w-8 h-8 object-contain" /> },
            { title: "Social Media Growth", icon: <img src={Phone} alt="Phone" className="w-8 h-8 object-contain" /> },
            { title: "Finance & Wealth", icon: <img src={MoneyBag} alt="MoneyBag" className="w-8 h-8 object-contain" /> },
            { title: "Marketing & Sales", icon: <img src={Target} alt="Target" className="w-8 h-8 object-contain" /> },
            { title: "Business Building", icon: <img src={Bag} alt="Bag" className="w-8 h-8 object-contain" /> },
            { title: "Relationships", icon: <img src={Heart} alt="Heart" className="w-8 h-8 object-contain" /> },
            { title: "Health & Fitness", icon: <img src={Fitness} alt="Fitness" className="w-8 h-8 object-contain" /> },
            { title: "OnlyFans", icon: <img src={OnlyFans} alt="OnlyFans" className="w-10 h-8 object-contain" /> },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center h-full p-6 bg-charcoalGray rounded text-center shadow-lg">
              <div className="flex items-center justify-center mb-3">{item.icon}</div>
              <div className="font-semibold text-[13px]">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
