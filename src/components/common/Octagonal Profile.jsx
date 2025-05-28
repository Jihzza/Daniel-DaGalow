// src/components/common/Octagonal Profile.jsx
import React, { useState, useEffect } from "react"; // Added useEffect

function OctagonalProfile({ size = 50, borderColor, innerBorderColor = "", onClick, imageSrc, fallbackText }) {
  const octagonClipPath = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
  const borderThickness = size * 0.05;
  const whiteSpaceThickness = size * 0.05;

  // State to handle image loading errors
  const [hasImageError, setHasImageError] = useState(false);

  const handleImageError = () => {
    setHasImageError(true);
  };

  // Reset error state if imageSrc changes
  useEffect(() => {
    setHasImageError(false);
  }, [imageSrc]);

  return (
    <div
      className="relative drop-shadow-lg"
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: borderColor,
          clipPath: octagonClipPath,
        }}
      />
      <div
        className="absolute"
        style={{
          top: `${borderThickness - 0.25}px`,
          left: `${borderThickness - 0.25}px`,
          right: `${borderThickness - 0.25}px`,
          bottom: `${borderThickness - 0.25}px`,
          backgroundColor: innerBorderColor || "#BFA200",
          clipPath: octagonClipPath,
        }}
      />
      <div
        className="absolute overflow-hidden flex items-center justify-center"
        style={{
          top: `${borderThickness + whiteSpaceThickness}px`,
          left: `${borderThickness + whiteSpaceThickness}px`,
          right: `${borderThickness + whiteSpaceThickness}px`,
          bottom: `${borderThickness + whiteSpaceThickness}px`,
          clipPath: octagonClipPath,
          backgroundColor: "#002147", // Fallback background for text
        }}
      >
        {imageSrc && !hasImageError ? (
          <img
            src={imageSrc}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={handleImageError} // Fallback to text if image fails to load
          />
        ) : (
          <div className="text-[#BFA200] font-bold flex items-center justify-center w-full h-full"
               style={{ fontSize: `${size * 0.45}px`, lineHeight: `${size * 0.9}px` }} // Adjust font size & line height
          >
            {(fallbackText || "?").slice(0,2)} {/* Ensure fallbackText is used, limit to 2 chars */}
          </div>
        )}
      </div>
    </div>
  );
}

export default OctagonalProfile;