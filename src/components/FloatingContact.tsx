import React, { useState } from "react";
import { MessageCircle, X, Instagram, Linkedin, Phone } from "lucide-react";

const FloatingContact = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  return (
    <>
      {/* Floating Contact Button */}
      {!isFooterVisible && (
        <button
          onClick={() => setIsFooterVisible(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 voice-button transition-all duration-200 hover:scale-110 animate-fade-in"
          aria-label="Show contact information"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Footer Overlay */}
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-[slide-in-up_0.3s_ease-out]">
          <div className="relative w-full py-6 px-4 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setIsFooterVisible(false)}
              className="absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 hover:bg-transparent group"
              aria-label="Hide contact information"
            >
              <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors duration-200" />
            </button>

            {/* Contact Links */}
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <a
                href="https://www.instagram.com/charansaiii?igsh=MXF0anByZ2lpeGY2aA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>@charansaiii</span>
              </a>

              <a
                href="https://www.linkedin.com/in/charansai-parvathala"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>Charansai Parvathala</span>
              </a>

              <a
                href="tel:+919182174316"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+91 91821 74316</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingContact;
