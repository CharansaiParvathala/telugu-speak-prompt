import { GEMINI_API_KEYS, GEMINI_API_URL, AVAILABLE_AUDIO_FILES } from "../config/geminiConfig";

type ConversationMessage = {
  userInput: string;
  audioResponse: string;
  timestamp: number;
};

let conversationHistory: ConversationMessage[] = [];
let currentKeyIndex = 0;

/**
 * Build system prompt with audio file list and instructions
 */
function buildSystemPrompt(): string {
  const audioList = AVAILABLE_AUDIO_FILES.join(", ");
  
  return `You are an intelligent audio response selector for a Telugu voice assistant.

CRITICAL INSTRUCTIONS:
1. User will send Telugu text (romanized or Telugu script)
2. You MUST respond with ONLY ONE audio filename from this list: ${audioList}
3. DO NOT add any explanation, punctuation, or extra text
4. ONLY return the exact filename with extension
5. Select the most appropriate audio based on the user's intent
6. Consider conversation context if provided

AUDIO FILE MEANINGS:
- audio.ogg: General greeting, hello, how are you responses
- audio1.ogg: Jokes, funny content, entertainment responses

EXAMPLE RESPONSES (these are the ONLY valid formats):
User: "namaste ela unnav"
You: audio.ogg

User: "joke cheppu"
You: audio1.ogg

Remember: ONLY return filename, nothing else!`;
}

/**
 * Build conversation context for better responses
 */
function buildConversationContext(): string {
  if (conversationHistory.length === 0) return "";
  
  const recentHistory = conversationHistory.slice(-3); // Last 3 exchanges
  const contextLines = recentHistory.map(msg => 
    `User said: "${msg.userInput}" -> Played: ${msg.audioResponse}`
  );
  
  return "\n\nRecent conversation:\n" + contextLines.join("\n");
}

/**
 * Call Gemini API with automatic key fallback
 */
async function callGeminiAPI(userInput: string, keyIndex: number = 0): Promise<string> {
  if (keyIndex >= GEMINI_API_KEYS.length) {
    throw new Error("All API keys failed");
  }

  const apiKey = GEMINI_API_KEYS[keyIndex];
  const systemPrompt = buildSystemPrompt();
  const conversationContext = buildConversationContext();
  
  const prompt = `${systemPrompt}${conversationContext}\n\nUser input: "${userInput}"\n\nYour response (filename only):`;

  try {
    console.log(`Calling Gemini API (key ${keyIndex + 1}/${GEMINI_API_KEYS.length})...`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API key ${keyIndex + 1} failed:`, response.status, errorText);
      
      // Try next key
      return callGeminiAPI(userInput, keyIndex + 1);
    }

    const data = await response.json();
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "audio.ogg";
    
    console.log("Gemini raw response:", geminiResponse);
    
    // Extract filename - handle cases where Gemini adds extra text
    let selectedFile = geminiResponse.toLowerCase();
    
    // Find matching audio file
    for (const audioFile of AVAILABLE_AUDIO_FILES) {
      if (selectedFile.includes(audioFile.toLowerCase())) {
        selectedFile = audioFile;
        break;
      }
    }
    
    // Validate response
    if (!AVAILABLE_AUDIO_FILES.includes(selectedFile)) {
      console.warn("Gemini returned invalid file, using default:", selectedFile);
      selectedFile = "audio.ogg";
    }
    
    console.log("Selected audio file:", selectedFile);
    currentKeyIndex = keyIndex; // Remember working key
    return selectedFile;
    
  } catch (error) {
    console.error(`Error with API key ${keyIndex + 1}:`, error);
    
    // Try next key
    if (keyIndex + 1 < GEMINI_API_KEYS.length) {
      return callGeminiAPI(userInput, keyIndex + 1);
    }
    
    throw error;
  }
}

/**
 * Main function to get audio response using Gemini
 */
export async function findGeminiMatch(transcript: string): Promise<string> {
  try {
    // Get audio file from Gemini
    const audioFile = await callGeminiAPI(transcript, currentKeyIndex);
    
    // Store in conversation history
    conversationHistory.push({
      userInput: transcript,
      audioResponse: audioFile,
      timestamp: Date.now()
    });
    
    // Keep only last 10 exchanges
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    return audioFile;
    
  } catch (error) {
    console.error("All Gemini API calls failed:", error);
    
    // Fallback to default
    return "audio.ogg";
  }
}

/**
 * Clear conversation history (useful for new sessions)
 */
export function clearConversationHistory() {
  conversationHistory = [];
  console.log("Conversation history cleared");
}
