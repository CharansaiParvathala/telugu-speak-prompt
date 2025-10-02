import React from "react";
import { Instagram, Linkedin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
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
    </footer>
  );
};

export default Footer;
