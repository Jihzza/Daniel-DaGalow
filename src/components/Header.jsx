// Update Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DaGalowLogo from '../assets/logos/DaGalow Logo.svg';
import Hamburger from '../assets/icons/Hamburger.svg';
import userImage from '../assets/img/Pessoas/Default.svg';
import AuthModal from './Auth/AuthModal';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const lastY = useRef(0);
  const { user, signOut } = useAuth();

  // Existing useEffect code...

  const handleProfileClick = () => {
    if (user) {
      // If user is logged in, navigate to profile
      window.location.href = '/profile';
    } else {
      // If user is not logged in, open auth modal
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <header
        className={`
          fixed flex items-center justify-between top-0 p-4 left-0 right-0 z-30 h-14 bg-black text-white shadow-lg
          transform transition-transform duration-300
          ${show ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className=''>
          <img 
            src={user?.avatar_url || userImage} 
            alt="User" 
            className='w-8 h-8 object-cover cursor-pointer'
            onClick={handleProfileClick}
          />
        </div>
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="focus:outline-none">
            <img
              src={DaGalowLogo}
              alt="DaGalow Logo"
              className="w-[150px] h-auto object-cover hover:opacity-90 transition-opacity duration-300"
            />
          </Link>
        </div>
        
        {/* Auth links - visible on desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <button 
              onClick={() => signOut()}
              className="text-white hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-darkGold text-black px-3 py-1 rounded hover:bg-opacity-90 transition-colors"
            >
              Login
            </button>
          )}
        </div>
          
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden focus:outline-none"
        >
          <img src={Hamburger} alt="Hamburger" className="w-6 h-6" />
        </button>
      </header>

      {/* Dropdown Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] bg-black transform transition-transform duration-300 ease-in-out z-50
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setMenuOpen(false)}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>
          
          {/* Menu links */}
          <div className="flex flex-col space-y-4">
            <Link to="/" 
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Auth links in mobile menu */}
            {user ? (
              <>
                <Link to="/profile" 
                  className="text-white text-xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="text-white text-xl hover:text-gray-300 transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="text-white text-xl hover:text-gray-300 transition-colors text-left"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}

export default Header;