import { transliterateTeluguToRoman } from "./teluguTransliterator";
import keywordsData from "../data/keywords.json";

type KeywordCategory = {
  keywords: string[];
  audioFile: string;
  weight: number;
};

type KeywordCategories = {
  [key: string]: KeywordCategory;
};

const keywordCategories: KeywordCategories = keywordsData.categories;

/**
 * Advanced similarity scoring with multiple strategies
 */
function calculateScore(transcript: string, keywords: string[]): number {
  const transcriptLower = transcript.toLowerCase().trim();
  const words = transcriptLower.split(/\s+/);
  let score = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Strategy 1: Exact match
    if (transcriptLower === keywordLower) {
      score += 5;
      continue;
    }
    
    // Strategy 2: Word-level matching
    for (const word of words) {
      if (word === keywordLower) {
        score += 3;
      } else if (word.includes(keywordLower) || keywordLower.includes(word)) {
        score += 2;
      } else if (fuzzyMatch(word, keywordLower)) {
        score += 1.5;
      }
    }
    
    // Strategy 3: Contains keyword
    if (transcriptLower.includes(keywordLower)) {
      score += 1;
    }
    
    // Strategy 4: Phonetic similarity
    if (soundsLike(transcriptLower, keywordLower)) {
      score += 1;
    }
  }
  
  return score;
}

/**
 * Enhanced fuzzy matching with edit distance
 */
function fuzzyMatch(str1: string, str2: string): boolean {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return true;
  if (Math.abs(str1.length - str2.length) > 3) return false;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  const similarity = (maxLen - distance) / maxLen;
  
  return similarity > 0.65;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Phonetic similarity check for different pronunciations
 */
function soundsLike(str1: string, str2: string): boolean {
  // Remove vowels for consonant skeleton matching
  const consonants1 = str1.replace(/[aeiou]/g, '');
  const consonants2 = str2.replace(/[aeiou]/g, '');
  
  if (consonants1 === consonants2) return true;
  
  // Check if consonant patterns are similar
  return fuzzyMatch(consonants1, consonants2);
}

/**
 * Detect if input is likely a greeting based on patterns
 */
function isLikelyGreeting(transcript: string): boolean {
  const greetingPatterns = [
    /^(hi|hey|hello|hola|namaste|salam)/i,
    /(good\s+(morning|evening|night|afternoon))/i,
    /(how\s+(are|r)\s+you)/i,
    /^\w{2,6}(\s+bro|\s+dude|\s+friend)?$/i, // Short words often greetings
  ];
  
  return greetingPatterns.some(pattern => pattern.test(transcript.trim()));
}

/**
 * Intelligent response matcher with multi-intent priority system
 */
export function findIntelligentMatch(transcript: string): string {
  // Transliterate if Telugu script detected
  const normalizedTranscript = /[\u0C00-\u0C7F]/.test(transcript)
    ? transliterateTeluguToRoman(transcript)
    : transcript;
  
  // If transcript is too short (1-2 chars), default response
  if (normalizedTranscript.trim().length <= 2) {
    return "audio.ogg";
  }
  
  console.log("Processing:", normalizedTranscript);
  
  // Score all categories and collect matches
  const categoryScores: Array<{ category: string; score: number; audioFile: string; weight: number }> = [];
  
  for (const [category, data] of Object.entries(keywordCategories)) {
    const score = calculateScore(normalizedTranscript, data.keywords);
    if (score > 0) {
      categoryScores.push({
        category,
        score: score * data.weight,
        audioFile: data.audioFile,
        weight: data.weight
      });
    }
  }
  
  // Sort by weighted score (highest priority first)
  categoryScores.sort((a, b) => b.score - a.score);
  
  // Log detected intents
  if (categoryScores.length > 0) {
    console.log("Detected intents:", categoryScores.map(c => `${c.category} (${c.score.toFixed(2)})`).join(", "));
  }
  
  // Return highest priority match
  if (categoryScores.length > 0) {
    console.log(`Selected: ${categoryScores[0].category} -> ${categoryScores[0].audioFile}`);
    return categoryScores[0].audioFile;
  }
  
  // Fallback: If no good match but looks like a greeting, use greeting response
  if (isLikelyGreeting(normalizedTranscript)) {
    console.log("Fallback: Detected as likely greeting");
    return "audio.ogg";
  }
  
  // Default response
  return "audio.ogg";
}
