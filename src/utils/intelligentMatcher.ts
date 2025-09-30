import { transliterateTeluguToRoman } from "./teluguTransliterator";

// Keyword categories with weights for intelligent matching
const keywordCategories = {
  greeting: {
    keywords: ["hello", "hi", "hey", "namaste", "namaskaram", "namskaram", "subhodayam", "vanakkam", "greetings"],
    audioFile: "audio.ogg",
    weight: 1.0
  },
  timeGreeting: {
    keywords: ["morning", "evening", "night", "afternoon", "subhodayam", "sayantramu", "ratri"],
    audioFile: "audio.ogg",
    weight: 1.0
  },
  howAreYou: {
    keywords: ["how", "ela", "ఎలా", "unnaru", "unnav", "bagunnara", "bagunnava", "bagunara", "bagunava"],
    audioFile: "audio.ogg",
    weight: 1.0
  },
  entertainment: {
    keywords: ["meme", "funny", "joke", "comedy", "hasya", "haasya", "memes", "fun", "laugh"],
    audioFile: "audio.ogg",
    weight: 0.9
  },
  question: {
    keywords: ["what", "when", "where", "why", "how", "ento", "emiti", "emitandi", "vishayam"],
    audioFile: "audio.ogg",
    weight: 0.8
  }
};

/**
 * Calculate similarity score between transcript and keywords
 */
function calculateScore(transcript: string, keywords: string[]): number {
  const transcriptLower = transcript.toLowerCase();
  let score = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Exact match
    if (transcriptLower === keywordLower) {
      score += 3;
    }
    // Contains whole word
    else if (transcriptLower.includes(` ${keywordLower} `) || 
             transcriptLower.startsWith(`${keywordLower} `) ||
             transcriptLower.endsWith(` ${keywordLower}`)) {
      score += 2;
    }
    // Partial match
    else if (transcriptLower.includes(keywordLower)) {
      score += 1;
    }
    // Fuzzy match (for typos)
    else if (fuzzyMatch(transcriptLower, keywordLower)) {
      score += 0.5;
    }
  }
  
  return score;
}

/**
 * Simple fuzzy matching for typos and variations
 */
function fuzzyMatch(str1: string, str2: string): boolean {
  if (Math.abs(str1.length - str2.length) > 2) return false;
  
  let matches = 0;
  const minLength = Math.min(str1.length, str2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / minLength > 0.7;
}

/**
 * Intelligent response matcher using keyword scoring
 */
export function findIntelligentMatch(transcript: string): string {
  // Transliterate if Telugu script detected
  const normalizedTranscript = /[\u0C00-\u0C7F]/.test(transcript)
    ? transliterateTeluguToRoman(transcript)
    : transcript;
  
  let bestMatch = { category: "", score: 0, audioFile: "audio.ogg" };
  
  // Score each category
  for (const [category, data] of Object.entries(keywordCategories)) {
    const score = calculateScore(normalizedTranscript, data.keywords) * data.weight;
    
    if (score > bestMatch.score) {
      bestMatch = {
        category,
        score,
        audioFile: data.audioFile
      };
    }
  }
  
  // Return best match or default
  return bestMatch.score > 0 ? bestMatch.audioFile : "audio.ogg";
}
