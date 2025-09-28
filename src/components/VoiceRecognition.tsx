import React, { useState, useRef, useCallback, useEffect } from "react";
import { Square } from "lucide-react";
import MicrophoneIcon from "./MicrophoneIcon";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
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
      
      let errorMessage = "Speech recognition error occurred";
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking clearly.";
          break;
        case "audio-capture":
          errorMessage = "Audio capture failed. Please check your microphone.";
          break;
        case "not-allowed":
          errorMessage = "Microphone access denied. Please allow microphone permissions.";
          break;
        case "network":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      toast({
        title: "Recognition Error",
        description: errorMessage,
        variant: "destructive",
      });
      
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
  }, [toast]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      recognitionRef.current.start();
      toast({
        title: "Listening Started",
        description: "Speak in Telugu - the romanized text will appear in the console.",
      });
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      });
    }
  }, [isSupported, toast]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    toast({
      title: "Listening Stopped",
      description: "Speech recognition has been stopped.",
    });
  }, [toast]);

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

        {/* Main microphone button with Gemini-style animation */}
        <div className="relative">
          {/* Breathing glow background */}
          {isListening && <div className="breathing-glow" style={{ width: '400px', height: '400px' }} />}
          
          {/* Gemini-style voice waves */}
          {isListening && (
            <div className="gemini-voice-animation">
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
            </div>
          )}
          
          {/* Spectrum bars inside microphone when active */}
          {isListening && (
            <div className="voice-spectrum">
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
              <div className="spectrum-bar"></div>
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