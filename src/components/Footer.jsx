// components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer id="contact" className="bg-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-4">
          <a href="https://instagram.com/" className="mx-2 hover:text-gold">Instagram</a>
          <a href="https://twitter.com/" className="mx-2 hover:text-gold">Twitter</a>
          <a href="https://youtube.com/" className="mx-2 hover:text-gold">YouTube</a>
          <a href="https://linkedin.com/" className="mx-2 hover:text-gold">LinkedIn</a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} John Doe Consulting. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
