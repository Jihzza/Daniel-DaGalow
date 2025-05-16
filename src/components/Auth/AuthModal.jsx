// components/auth/AuthModal.jsx
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword"; // Add this import
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

  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal content */}
        <div
          className="bg-gentleGray rounded-lg w-full max-w-md mx-4 overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - absolutely positioned top right */}
          <button
            className="absolute top-2 right-3 z-10 text-oxfordBlue"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
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
          {/* Tab navigation - Only show for login/signup */}
          {view !== "forgot-password" && (
            <div className="flex border-b mt-3">
              {/* Tab buttons */}
              <button
                className={`flex-1 py-4 text-center font-medium ${
                  view === "login"
                    ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                    : "text-gray-500"
                }`}
                onClick={() => setView("login")}
              >
                Log In
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium ${
                  view === "signup"
                    ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                    : "text-gray-500"
                }`}
                onClick={() => setView("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Auth form content */}
          <div className="p-6">
            {view === "login" ? (
              <>
                <button
                  className="w-full flex items-center justify-center py-2 mb-4 border border-oxfordBlue rounded-lg"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                    });
                    if (error) {
                      alert("Google sign-in failed: " + error.message);
                    }
                  }}
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2"
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
              <Signup
                isModal={true}
                onSuccess={onClose}
                onSwitchToLogin={() => setView("login")}
              />
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
