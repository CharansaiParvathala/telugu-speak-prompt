// Telugu script to romanized text mapping
const teluguToRoman: { [key: string]: string } = {
  // Vowels
  'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u', 'ఊ': 'oo',
  'ఋ': 'ru', 'ౠ': 'ruu', 'ఌ': 'lu', 'ౡ': 'luu', 'ఎ': 'e', 'ఏ': 'ee',
  'ఐ': 'ai', 'ఒ': 'o', 'ఓ': 'oo', 'ఔ': 'au',
  
  // Consonants
  'క': 'ka', 'ఖ': 'kha', 'గ': 'ga', 'ఘ': 'gha', 'ఙ': 'nga',
  'చ': 'cha', 'ఛ': 'chha', 'జ': 'ja', 'ఝ': 'jha', 'ఞ': 'nja',
  'ట': 'ta', 'ఠ': 'tha', 'డ': 'da', 'ఢ': 'dha', 'ణ': 'na',
  'త': 'ta', 'థ': 'tha', 'ద': 'da', 'ధ': 'dha', 'న': 'na',
  'ప': 'pa', 'ఫ': 'pha', 'బ': 'ba', 'భ': 'bha', 'మ': 'ma',
  'య': 'ya', 'ర': 'ra', 'ల': 'la', 'వ': 'va', 'శ': 'sha',
  'ష': 'sha', 'స': 'sa', 'హ': 'ha', 'ళ': 'la', 'క్ష': 'ksha',
  'జ్ఞ': 'gna',
  
  // Vowel signs (matras)
  'ా': 'aa', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo',
  'ృ': 'ru', 'ౄ': 'ruu', 'ె': 'e', 'ే': 'ee', 'ై': 'ai',
  'ొ': 'o', 'ో': 'oo', 'ౌ': 'au', '్': '', 'ం': 'm', 'ః': 'h',
};

// Common Telugu words to romanized mapping
const commonWordsMapping: { [key: string]: string } = {
  'హలో': 'hello',
  'హాయ్': 'hi',
  'నమస్తే': 'namaste',
  'నమస్కారం': 'namaskaram',
  'ఎలా': 'ela',
  'ఉన్నారు': 'unnaru',
  'ఉన్నావ్': 'unnav',
  'బగున్నారా': 'bagunnara',
  'బగున్నావా': 'bagunnava',
  'సుభోదయం': 'subhodayam',
  'మీమ్': 'meme',
  'జోక్': 'joke',
  'కామెడీ': 'comedy',
  'హాస్యం': 'hasya',
  'ఎందుకు': 'enduku',
  'చెప్పు': 'cheppu',
  'చెప్పండి': 'cheppandi',
  'ఏదైనా': 'edaina',
};

/**
 * Common speech recognition errors and their corrections
 * Maps common misrecognitions to correct Telugu words
 */
const speechCorrectionMap: { [key: string]: string } = {
  // "enduku" (why) variations
  "emdaukau": "enduku",
  "emduku": "enduku", 
  "emdhuku": "enduku",
  "yenduku": "enduku",
  "yemdhuku": "enduku",
  "emdaku": "enduku",
  
  // "ela" (how) variations
  "yela": "ela",
  "ila": "ela",
  "elaa": "ela",
  
  // "unnav" (are you) variations
  "vunnav": "unnav",
  "unnavu": "unnav",
  "vunnavu": "unnav",
  "unav": "unnav",
  "unavu": "unnav",
  
  // "cheppu" (tell) variations
  "chepavu": "cheppu",
  "cheppavu": "cheppu",
  "chepu": "cheppu",
  "sheppu": "cheppu",
  "cheppandi": "cheppu",
  
  // "edaina" (something) variations
  "eidaina": "edaina",
  "edhaina": "edaina",
  "yadaina": "edaina",
  "yedaina": "edaina",
  "edina": "edaina",
  
  // "bagunnava" (are you good) variations
  "bagunnav": "bagunnava",
  "baagunnava": "bagunnava",
  "bhagunnava": "bagunnava",
  "bagunava": "bagunnava",
  "baagunava": "bagunnava",
  
  // "namaste" variations
  "namasthe": "namaste",
  "namaskaram": "namaste",
  "namskaram": "namaste",
  "namaskar": "namaste",
  
  // Common words
  "joku": "joke",
  "jokeu": "joke",
  "memu": "meme",
  "meem": "meme",
  "helo": "hello",
  "halo": "hello",
};

/**
 * Simple Levenshtein distance for correction matching
 */
function calculateLevenshtein(str1: string, str2: string): number {
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
 * Apply speech recognition corrections to handle common misrecognitions
 */
export function correctSpeechErrors(text: string): string {
  let corrected = text.toLowerCase().trim();
  
  // Apply word-level corrections
  const words = corrected.split(/\s+/);
  const correctedWords = words.map(word => {
    // Check exact matches first
    if (speechCorrectionMap[word]) {
      console.log(`Correcting: ${word} -> ${speechCorrectionMap[word]}`);
      return speechCorrectionMap[word];
    }
    
    // Check for partial matches with high similarity
    for (const [error, correction] of Object.entries(speechCorrectionMap)) {
      if (word.length >= 4 && error.length >= 4) {
        // Levenshtein distance check for close matches
        const distance = calculateLevenshtein(word, error);
        if (distance <= 2) {
          console.log(`Fuzzy correcting: ${word} -> ${correction} (distance: ${distance})`);
          return correction;
        }
      }
    }
    
    return word;
  });
  
  return correctedWords.join(" ");
}

export function transliterateTeluguToRoman(text: string): string {
  // First try exact word mapping
  const lowerText = text.toLowerCase().trim();
  if (commonWordsMapping[lowerText]) {
    return commonWordsMapping[lowerText];
  }
  
  // Check for common phrases
  for (const [telugu, roman] of Object.entries(commonWordsMapping)) {
    if (lowerText.includes(telugu)) {
      return text.replace(new RegExp(telugu, 'gi'), roman);
    }
  }
  
  // Character by character transliteration as fallback
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (teluguToRoman[char]) {
      result += teluguToRoman[char];
    } else {
      result += char;
    }
  }
  
  return result.toLowerCase().trim();
}

export function findMatchingResponse(transcript: string, responses: { [key: string]: string }): string {
  const cleanText = transcript.toLowerCase().trim();
  
  // First check if it's Telugu script and transliterate
  const romanizedText = transliterateTeluguToRoman(cleanText);
  
  // Check exact matches first
  if (responses[cleanText]) return responses[cleanText];
  if (responses[romanizedText]) return responses[romanizedText];
  
  // Check partial matches
  for (const [key, value] of Object.entries(responses)) {
    if (key === 'default') continue;
    
    // Check if the key is contained in the text
    if (cleanText.includes(key) || romanizedText.includes(key)) {
      return value;
    }
    
    // Check if the text is contained in the key
    if (key.includes(cleanText) || key.includes(romanizedText)) {
      return value;
    }
  }
  
  return responses.default || 'audio.ogg';
}