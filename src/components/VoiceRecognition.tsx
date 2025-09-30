import React, { useState, useRef, useCallback, useEffect } from "react";
import { Square } from "lucide-react";
import MicrophoneIcon from "./MicrophoneIcon";
import { findIntelligentMatch } from "../utils/intelligentMatcher";
import { audioManager } from "../utils/audioManager";

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

  useEffect(() => {
    // Preload all audio files for instant playback
    audioManager.preloadAudio(["audio.ogg", "audio1.ogg"]);
  }, []);

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
      // When new speech starts, stop any playing audio
      audioManager.stop();
      finalTranscript = "";
      console.log("New speech detected - stopping audio and clearing transcript");
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
    // Use intelligent matcher to find best response
    const audioFile = findIntelligentMatch(transcript);
    
    // Play using preloaded audio manager for instant response
    audioManager.play(audioFile, 1.5); // 1.5x speed for faster response
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
              {/* Generate 90 particles for complete circle coverage */}
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="cosmic-particle"
                  style={{
                    '--delay': `${i * 0.1}s`,
                    '--rotation': `${i * 4}deg`,
                    '--orbit-size': `${60 + (i % 3) * 8}px`,
                  } as React.CSSProperties}
                />
              ))}
              
              {/* Smooth sound wave ripples */}
              <div className="sound-ripples">
                <div className="ripple"></div>
                <div className="ripple"></div>
                <div className="ripple"></div>
                <div className="ripple"></div>
              </div>
              
              {/* Glowing smoke ring */}
              <div className="glow-ring"></div>
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