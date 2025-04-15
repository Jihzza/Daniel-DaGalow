// components/Booking.js
import React, { useState } from 'react';

function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could integrate your booking system or connect to n8n workflows
    console.log('Booking submitted:', formData);
    alert("Thanks! We'll get back to you soon.");
  };

  return (
    <section id="booking" className="py-16 px-4 bg-white">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Book a Consultation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none"
            required
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-darkGold hover:bg-yellow-600 text-black font-bold p-3 rounded"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </section>
  );
}

export default Booking;
