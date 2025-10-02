import React from "react";
import VoiceRecognition from "@/components/VoiceRecognition";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <VoiceRecognition />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
