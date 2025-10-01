import { transliterateTeluguToRoman, correctSpeechErrors } from "./teluguTransliterator";
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
 * Synonym mapping for better intent understanding
 */
const synonymMap: { [key: string]: string[] } = {
  "joke": ["funny", "comedy", "meme", "hasya", "haasya", "navvu"],
  "cheppu": ["tell", "say", "chepandi", "chepu", "cheppandi", "chepava"],
  "edaina": ["something", "anything", "entaina", "edhaina", "konni", "oka"],
  "ela": ["how", "yela", "eppudu"],
  "unnav": ["unnaru", "vunnav", "vunnava", "unavu"],
  "bagunnava": ["bagunnara", "bagunara", "bagunava", "baagunava"],
  "hello": ["hi", "hey", "namaste", "namaskaram"],
  "morning": ["subhodayam", "suprabhatam", "gudmorning"],
  "story": ["katha", "kadha", "kathalu", "tale"],
  "song": ["paata", "patalu", "music", "ganam"],
};

/**
 * Expand keywords with synonyms for better matching
 */
function expandWithSynonyms(keyword: string): string[] {
  const expanded = [keyword];
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (keyword === key || synonyms.includes(keyword)) {
      expanded.push(key, ...synonyms);
    }
  }
  return [...new Set(expanded)];
}

/**
 * Advanced similarity scoring with multiple strategies
 */
function calculateScore(transcript: string, keywords: string[]): number {
  const transcriptLower = transcript.toLowerCase().trim();
  const words = transcriptLower.split(/\s+/);
  let score = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const expandedKeywords = expandWithSynonyms(keywordLower);
    
    for (const expandedKeyword of expandedKeywords) {
      // Strategy 1: Exact match
      if (transcriptLower === expandedKeyword) {
        score += 8;
        continue;
      }
      
      // Strategy 2: Word-level exact matching
      for (const word of words) {
        if (word === expandedKeyword) {
          score += 5;
        } else if (word.includes(expandedKeyword) && expandedKeyword.length > 2) {
          score += 3;
        } else if (expandedKeyword.includes(word) && word.length > 2) {
          score += 3;
        } else if (fuzzyMatch(word, expandedKeyword)) {
          score += 2;
        }
      }
      
      // Strategy 3: Contains keyword (partial match)
      if (transcriptLower.includes(expandedKeyword) && expandedKeyword.length > 2) {
        score += 2;
      }
      
      // Strategy 4: Phonetic similarity
      if (soundsLike(transcriptLower, expandedKeyword)) {
        score += 1.5;
      }
      
      // Strategy 5: Start/end matching (important for Telugu)
      for (const word of words) {
        if (word.startsWith(expandedKeyword) && expandedKeyword.length > 2) {
          score += 2;
        }
        if (word.endsWith(expandedKeyword) && expandedKeyword.length > 2) {
          score += 2;
        }
      }
    }
  }
  
  return score;
}

/**
 * Enhanced fuzzy matching with edit distance
 */
function fuzzyMatch(str1: string, str2: string): boolean {
  if (str1.length < 3 || str2.length < 3) return false;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return true;
  if (Math.abs(str1.length - str2.length) > 4) return false;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  const similarity = (maxLen - distance) / maxLen;
  
  // More lenient for longer strings
  const threshold = maxLen > 6 ? 0.6 : 0.7;
  return similarity > threshold;
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
    /^(hi|hey|hello|hola|namaste|namaskaram|salam|aleikum)/i,
    /(good\s+(morning|evening|night|afternoon))/i,
    /(how\s+(are|r)\s+you)/i,
    /(ela\s+unnav|ela\s+unnaru|bagunnava)/i,
    /^\w{2,6}(\s+(bro|dude|friend|guru|anna|mate))?$/i,
  ];
  
  return greetingPatterns.some(pattern => pattern.test(transcript.trim()));
}

/**
 * Remove low-priority noise words to focus on intent
 */
function removeNoiseWords(transcript: string): string {
  const noiseWords = ["bro", "guru", "anna", "friend", "dude", "mate", "please", "pls", "now", "rey", "ra", "le"];
  const words = transcript.toLowerCase().split(/\s+/);
  const filtered = words.filter(word => !noiseWords.includes(word));
  return filtered.join(" ");
}

/**
 * Intelligent response matcher with multi-intent priority system
 */
export function findIntelligentMatch(transcript: string): string {
  // Transliterate if Telugu script detected
  let normalizedTranscript = /[\u0C00-\u0C7F]/.test(transcript)
    ? transliterateTeluguToRoman(transcript)
    : transcript;
  
  // Apply speech error corrections
  normalizedTranscript = correctSpeechErrors(normalizedTranscript);
  
  // If transcript is too short (1-2 chars), default response
  if (normalizedTranscript.trim().length <= 2) {
    return "audio.ogg";
  }
  
  console.log("Original:", transcript);
  console.log("Corrected:", normalizedTranscript);
  
  // Remove noise words to focus on core intent
  const cleanedTranscript = removeNoiseWords(normalizedTranscript);
  console.log("Cleaned:", cleanedTranscript);
  
  // Score all categories with both original and cleaned transcript
  const categoryScores: Array<{ category: string; score: number; audioFile: string; weight: number }> = [];
  
  for (const [category, data] of Object.entries(keywordCategories)) {
    // Score with original transcript
    const originalScore = calculateScore(normalizedTranscript, data.keywords);
    // Score with cleaned transcript (more weight)
    const cleanedScore = calculateScore(cleanedTranscript, data.keywords) * 1.3;
    
    const totalScore = Math.max(originalScore, cleanedScore);
    
    if (totalScore > 0) {
      categoryScores.push({
        category,
        score: totalScore * data.weight,
        audioFile: data.audioFile,
        weight: data.weight
      });
    }
  }
  
  // Sort by weighted score (highest priority first)
  categoryScores.sort((a, b) => b.score - a.score);
  
  // Log detected intents (top 3)
  if (categoryScores.length > 0) {
    const topIntents = categoryScores.slice(0, 3).map(c => `${c.category} (${c.score.toFixed(1)})`).join(", ");
    console.log("Top intents:", topIntents);
  }
  
  // Return highest priority match if score is significant
  if (categoryScores.length > 0 && categoryScores[0].score > 3) {
    console.log(`✓ Selected: ${categoryScores[0].category} -> ${categoryScores[0].audioFile}`);
    return categoryScores[0].audioFile;
  }
  
  // Fallback: If no good match but looks like a greeting, use greeting response
  if (isLikelyGreeting(normalizedTranscript)) {
    console.log("Fallback: Detected as likely greeting");
    return "audio.ogg";
  }
  
  // Final fallback: if there's any match at all, use the highest
  if (categoryScores.length > 0) {
    console.log(`Weak match: ${categoryScores[0].category} -> ${categoryScores[0].audioFile}`);
    return categoryScores[0].audioFile;
  }
  
  // Default response
  console.log("Default response");
  return "audio.ogg";
}
