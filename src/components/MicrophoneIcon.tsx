import React from "react";

interface MicrophoneIconProps {
  className?: string;
  isActive?: boolean;
}

const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ 
  className = "", 
  isActive = false 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`voice-icon ${className}`}
      aria-label={isActive ? "Recording audio" : "Start recording"}
    >
      {/* Microphone body */}
      <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
      
      {/* Microphone stand */}
      <path d="M12 18v4" />
      <path d="M8 22h8" />
      
      {/* Sound waves when active */}
      {isActive && (
        <>
          <path 
            d="M19 10v2a7 7 0 0 1-14 0v-2" 
            className="animate-pulse"
            opacity="0.7"
          />
          <path 
            d="M16 8v4a4 4 0 0 1-8 0V8" 
            className="animate-pulse"
            opacity="0.5"
            style={{ animationDelay: "0.2s" }}
          />
        </>
      )}
      
      {/* Standard microphone path when not active */}
      {!isActive && (
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      )}
    </svg>
  );
};

export default MicrophoneIcon;