import React from "react";

function OctagonalProfile({ size = 50, borderColor, innerBorderColor = "", onClick, imageSrc, fallbackText }) {
  // Define the octagon shape once as a variable for consistency
  const octagonClipPath = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
  
  // Calculate spacing sizes based on the component size
  const borderThickness = size * 0.05;
  const whiteSpaceThickness = size * 0.05;
  
  return (
    <div 
      className="relative drop-shadow-lg" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
      onClick={onClick}
    >
      {/* 1) Outer layer: colored border */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: borderColor,
          clipPath: octagonClipPath,
        }}
      />

      {/* 2) Middle layer: inner border */}
      <div
        className="absolute"
        style={{
          top: `${borderThickness - 0.25}px`,
          left: `${borderThickness - 0.25}px`,
          right: `${borderThickness - 0.25}px`,
          bottom: `${borderThickness - 0.25}px`,
          backgroundColor: innerBorderColor || "#234243",
          clipPath: octagonClipPath,
        }}
      />

      {/* 3) Inner layer: image or fallback text */}
      <div
        className="absolute overflow-hidden flex items-center justify-center"
        style={{
          top: `${borderThickness + whiteSpaceThickness}px`,
          left: `${borderThickness + whiteSpaceThickness}px`,
          right: `${borderThickness + whiteSpaceThickness}px`,
          bottom: `${borderThickness + whiteSpaceThickness}px`,
          clipPath: octagonClipPath,
          backgroundColor: "#eedebe",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-[#234243] text-4xl font-bold">
            {fallbackText || "?"}
          </div>
        )}
      </div>
    </div>
  );
}

export default OctagonalProfile;
