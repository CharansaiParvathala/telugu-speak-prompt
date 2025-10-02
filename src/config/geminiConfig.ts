/**
 * Gemini API Configuration
 * Multiple keys for fallback support
 * 
 * For deployment on Vercel:
 * Set environment variable: VITE_GEMINI_API_KEYS
 * Value format: key1,key2,key3 (comma-separated, no spaces)
 */

// Read API keys from environment variable (comma-separated) or use demo keys
const envKeys = import.meta.env.VITE_GEMINI_API_KEYS;
export const GEMINI_API_KEYS = envKeys 
  ? envKeys.split(',').map((key: string) => key.trim())
  : [
      "AIzaSyDEMO_KEY_1_REPLACE_WITH_REAL_KEY",
      "AIzaSyDEMO_KEY_2_REPLACE_WITH_REAL_KEY", 
      "AIzaSyDEMO_KEY_3_REPLACE_WITH_REAL_KEY"
    ];

export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

/**
 * Available audio response files
 * Update this list when adding new audio files
 */
export const AVAILABLE_AUDIO_FILES = [
  "audio.ogg",
  "audio1.ogg"
];
