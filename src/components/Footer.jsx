// components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer id="contact" className="bg-black text-white py-6 px-4">
      <div className="max-w-5xl mx-auto text-center">
        
        <p className="text-sm mb-6">&copy; {new Date().getFullYear()} Daniel DaGalow. All rights reserved.</p>
        <div className="flex justify-center items-center">
          <a href="https://instagram.com/" className="mx-2 hover:text-gold">Instagram</a>
          <a href="https://twitter.com/" className="mx-2 hover:text-gold">Twitter</a>
          <a href="https://youtube.com/" className="mx-2 hover:text-gold">YouTube</a>
          <a href="https://linkedin.com/" className="mx-2 hover:text-gold">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
