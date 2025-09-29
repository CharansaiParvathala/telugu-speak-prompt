import React, { useState, useRef, useCallback, useEffect } from "react";
import { Square } from "lucide-react";
import MicrophoneIcon from "./MicrophoneIcon";
import responsesData from "../data/responses.json";
import { findMatchingResponse } from "../utils/teluguTransliterator";

// Extend the Window interface for webkit speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceRecognition: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.log("Speech Recognition not supported");
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    
    // Configure for Telugu language with romanized output
    recognition.lang = "te-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onstart = () => {
      console.log("Speech recognition started for Telugu (te-IN)");
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript = transcript;
          
          // Log the final romanized Telugu transcription to console
          console.log("Telugu Transcription (Romanized):", finalTranscript.trim());
          
          // Play audio response
          playAudioResponse(finalTranscript.trim());
          
          // Clear for next utterance
          finalTranscript = "";
        } else {
          interimTranscript = transcript;
        }
      }
    };

    recognition.onspeechstart = () => {
      // When new speech starts, clear any previous partial results
      finalTranscript = "";
      console.log("New speech detected - clearing previous transcript");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const playAudioResponse = useCallback((transcript: string) => {
    // Find matching response using the transliterator
    const audioFile = findMatchingResponse(transcript, responsesData.responses);
    
    // Create audio element with the correct file
    if (!audioRef.current) {
      audioRef.current = new Audio(`/${audioFile}`);
    } else {
      audioRef.current.src = `/${audioFile}`;
    }
    
    // Play the response audio
    audioRef.current.play().catch(error => {
      console.log("Audio playback failed:", error);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      recognitionRef.current.start();
      console.log("Speech recognition started");
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Speech recognition stopped");
    } catch (error) {
      console.error("Error stopping recognition:", error);
      setIsListening(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <div className="voice-button opacity-50 cursor-not-allowed mb-6">
            <MicrophoneIcon isActive={false} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Speech Recognition Not Supported
          </h2>
          <p className="text-muted-foreground">
            Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* App Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-16">
          Telugu Meme Chat
        </h1>

        {/* Main microphone button with cosmic particle animation */}
        <div className="relative">
          {/* Cosmic particle field - behind button */}
          {isListening && (
            <div className="cosmic-listening-field">
              {/* Generate 30 floating particles for better performance */}
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="cosmic-particle"
                  style={{
                    '--delay': `${i * 0.15}s`,
                    '--rotation': `${i * 12}deg`,
                    '--orbit-size': `${100 + (i % 4) * 30}px`,
                    '--z-depth': `${(i % 3) + 1}`,
                  } as React.CSSProperties}
                />
              ))}
              
              {/* Sound wave ripples */}
              <div className="sound-ripples">
                <div className="ripple"></div>
                <div className="ripple"></div>
                <div className="ripple"></div>
              </div>
              
              {/* Central energy core */}
              <div className="energy-core"></div>
            </div>
          )}
          
          <button
            onClick={isListening ? stopListening : startListening}
            className={`voice-button ${isListening ? "active" : ""}`}
            disabled={!isSupported}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            <MicrophoneIcon isActive={isListening} />
          </button>
        </div>

        {/* Stop button (only visible when recording) */}
        {isListening && (
          <button
            onClick={stopListening}
            className="stop-button animate-fade-in mt-16"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecognition;