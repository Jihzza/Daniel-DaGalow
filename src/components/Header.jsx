// components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DaGalowLogo from '../assets/DaGalow Logo.svg';
import Hamburger from '../assets/Hamburger.svg';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="top-0 left-0 right-0 bg-black text-white z-50 w-full h-14 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <img src={DaGalowLogo} alt="DaGalow Logo" className='w-[150px] h-auto object-cover' />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          <img src={Hamburger} alt="Hamburger" className='w-6 h-6' />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] bg-black transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" 
                   viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-white" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="./Subpages/Music" className="text-white" onClick={() => setMenuOpen(false)}>Music</Link>
            <Link to="./Subpages/Videos" className="text-white" onClick={() => setMenuOpen(false)}>Videos</Link>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;
