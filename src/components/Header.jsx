import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DaGalowLogo from '../assets/logos/DaGalow Logo.svg';
import Hamburger   from '../assets/icons/Hamburger.svg';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(true);          // whether header is visible
  const lastY = useRef(0);                         // last scrollY

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      // if we scrolled down and past 50px, hide
      if (currentY > lastY.current && currentY > 0) {
        setShow(false);
      // if we scrolled up, show
      } else if (currentY < lastY.current) {
        setShow(true);
      }
      lastY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-30 h-14 bg-black text-white shadow-lg
          transform transition-transform duration-300
          ${show ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="focus:outline-none">
            <img
              src={DaGalowLogo}
              alt="DaGalow Logo"
              className="w-[150px] h-auto object-cover hover:opacity-90 transition-opacity duration-300"
            />
          </Link>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden focus:outline-none"
          >
            <img src={Hamburger} alt="Hamburger" className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Dropdown Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] bg-black transform transition-transform duration-300 ease-in-out z-50
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* … rest of menu … */}
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Header;
