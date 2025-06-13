import React, { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import { supabase } from "../../utils/supabaseClient"; // adjust path as needed

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Clean up in case the component unmounts while open
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handler function for Google Sign-In
  const handleGoogleSignIn = async () => {
    // 1. Store the scroll position and current page path
    sessionStorage.setItem('scrollPosition', window.scrollY);
    sessionStorage.setItem('scrollPath', window.location.pathname);

    // 2. Initiate the OAuth flow
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Make sure the user is redirected back to the page they were on
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      // It's better to use a more user-friendly notification system than alert()
      // but for now we'll keep the existing logic.
      console.error("Google sign-in failed:", error);
      alert("Google sign-in failed: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay - Standard dark overlay is good for focus */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal content */}
        <div
          // STYLE CHANGE:
          // - Changed background from `bg-gentleGray` to `bg-white` for a clean look.
          // - Added `shadow-xl` to give the modal depth against the overlay.
          className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden relative shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            // STYLE CHANGE:
            // - Adjusted text color for better contrast and a more subtle look on a white background.
            className="absolute top-3 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6" // Increased size slightly for easier clicking
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Tab navigation */}
          {view !== "forgot-password" && (
            <div className="flex border-b border-gray-200 mt-4">
              {/* Tab buttons - Retained the core logic but adjusted for the new theme */}
              <button
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                  view === "login"
                    ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setView("login")}
              >
                Log In
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                  view === "signup"
                    ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setView("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Auth form content */}
          <div className="p-6 sm:p-8">
            {view === "login" ? (
              <>
                <button
                  // STYLE CHANGE:
                  // - Styled to be a secondary button: white background, gray border.
                  // - This makes the primary action button within the Login form stand out more.
                  className="w-full flex items-center justify-center py-2.5 mb-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleGoogleSignIn}
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  Continue with Google
                </button>
                <Login
                  isModal={true}
                  onSuccess={onClose}
                  onForgotPassword={() => setView("forgot-password")}
                />
              </>
            ) : view === "signup" ? (
              <>
                <button
                   // STYLE CHANGE:
                  // - Same styling as the login view for consistency.
                  className="w-full flex items-center justify-center py-2.5 mb-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleGoogleSignIn}
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  Continue with Google
                </button>
                <Signup
                  isModal={true}
                  onSuccess={onClose}
                  onSwitchToLogin={() => setView("login")}
                />
              </>
            ) : (
              <ForgotPassword
                isModal={true}
                onSuccess={onClose}
                onBackToLogin={() => setView("login")}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
