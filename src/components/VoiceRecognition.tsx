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
        {/* Main microphone button */}
        <div className="relative mb-8">
          {isListening && (
            <>
              <div className="pulse-rings" />
              <div className="pulse-rings" style={{ animationDelay: "0.5s" }} />
              <div className="pulse-rings" style={{ animationDelay: "1s" }} />
            </>
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

        {/* Status text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Telugu Voice Recognition
          </h1>
          <p className="text-muted-foreground max-w-md">
            {isListening 
              ? "Listening for Telugu speech... Check the console for transcriptions."
              : "Click the microphone to start speaking in Telugu"
            }
          </p>
        </div>

        {/* Stop button (only visible when recording) */}
        {isListening && (
          <button
            onClick={stopListening}
            className="stop-button animate-fade-in"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </button>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center max-w-lg">
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Speaks Telugu and get romanized text output</li>
              <li>• Continuous listening until you stop</li>
              <li>• Results appear in browser console (F12)</li>
              <li>• Pauses in speech trigger transcription</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognition;