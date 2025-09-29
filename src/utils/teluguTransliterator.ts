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
};

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