import React, { useState } from "react";
import { MessageCircle, X, Instagram, Linkedin, Phone } from "lucide-react";
import { Button } from "./ui/button";

const FloatingContact = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  return (
    <>
      {/* Floating Contact Button */}
      {!isFooterVisible && (
        <Button
          onClick={() => setIsFooterVisible(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          size="icon"
          aria-label="Show contact information"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Footer Overlay */}
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-right">
          <div className="relative w-full py-6 px-4 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg">
            {/* Close Button */}
            <Button
              onClick={() => setIsFooterVisible(false)}
              className="absolute top-2 right-2"
              size="icon"
              variant="ghost"
              aria-label="Hide contact information"
            >
              <X className="h-4 w-4" />
            </Button>

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
