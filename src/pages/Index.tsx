import React from "react";
import VoiceRecognition from "@/components/VoiceRecognition";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingContact from "@/components/FloatingContact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <VoiceRecognition />

      {/* Floating Contact */}
      <FloatingContact />
    </div>
  );
};

export default Index;
