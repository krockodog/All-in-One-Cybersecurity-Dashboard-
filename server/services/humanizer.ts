/**
 * Humanizer Engine - Report Text Humanization
 * Converts AI-generated text to professional, natural-sounding reports
 */

export interface HumanizerConfig {
  language: 'de' | 'en';
  professionLevel: 'technical' | 'management' | 'mixed';
  sentenceVariation: boolean;
  activeVoicePreference: boolean;
  tonality: 'formal' | 'semi-formal' | 'direct';
  avoidAIPhrases: boolean;
  industryTerminology: boolean;
}

const DEFAULT_CONFIG: HumanizerConfig = {
  language: 'de',
  professionLevel: 'mixed',
  sentenceVariation: true,
  activeVoicePreference: true,
  tonality: 'formal',
  avoidAIPhrases: true,
  industryTerminology: true,
};

// AI Phrase Patterns to Remove/Replace
const AI_PHRASES = {
  de: [
    { pattern: /Es ist wichtig zu beachten, dass/gi, replace: '' },
    { pattern: /Basierend auf den Daten/gi, replace: 'Die Analyse zeigt' },
    { pattern: /Es wurde festgestellt, dass/gi, replace: 'Wir haben festgestellt, dass' },
    { pattern: /Es ist möglich, dass/gi, replace: 'Es kann sein, dass' },
    { pattern: /Darüber hinaus/gi, replace: 'Zusätzlich' },
    { pattern: /Zusammenfassend lässt sich sagen/gi, replace: 'Zusammengefasst' },
    { pattern: /In Anbetracht der Tatsache, dass/gi, replace: 'Da' },
  ],
  en: [
    { pattern: /It is important to note that/gi, replace: '' },
    { pattern: /Based on the data/gi, replace: 'The analysis shows' },
    { pattern: /It was found that/gi, replace: 'We found that' },
    { pattern: /It is possible that/gi, replace: 'It may be that' },
    { pattern: /Furthermore/gi, replace: 'Additionally' },
    { pattern: /To summarize/gi, replace: 'In summary' },
    { pattern: /In light of the fact that/gi, replace: 'Since' },
  ],
};

// Passive Voice Patterns (de)
const PASSIVE_VOICE_DE = [
  { pattern: /wurde durchgeführt/gi, replace: 'führten wir durch' },
  { pattern: /wurde identifiziert/gi, replace: 'identifizierten wir' },
  { pattern: /wurde festgestellt/gi, replace: 'stellten wir fest' },
  { pattern: /wurde gefunden/gi, replace: 'fanden wir' },
  { pattern: /ist bekannt/gi, replace: 'wissen wir' },
];

const PASSIVE_VOICE_EN = [
  { pattern: /was performed/gi, replace: 'we performed' },
  { pattern: /was identified/gi, replace: 'we identified' },
  { pattern: /was found/gi, replace: 'we found' },
  { pattern: /is known/gi, replace: 'we know' },
];

// Industry Terminology (Cybersecurity)
const INDUSTRY_TERMS = {
  de: {
    'Sicherheitslücke': 'Schwachstelle',
    'Fehler': 'Vulnerability',
    'Angriff': 'Attack Vector',
    'Risiko': 'Exposure',
  },
  en: {
    'vulnerability': 'security flaw',
    'bug': 'weakness',
    'attack': 'threat vector',
    'risk': 'exposure',
  },
};

export class HumanizerEngine {
  private config: HumanizerConfig;

  constructor(config: Partial<HumanizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Humanize text based on configuration
   */
  humanize(text: string): string {
    let result = text;

    // Step 1: Remove AI Phrases
    if (this.config.avoidAIPhrases) {
      result = this.removeAIPhrases(result);
    }

    // Step 2: Convert Passive to Active Voice
    if (this.config.activeVoicePreference) {
      result = this.convertToActiveVoice(result);
    }

    // Step 3: Apply Sentence Variation
    if (this.config.sentenceVariation) {
      result = this.applySentenceVariation(result);
    }

    // Step 4: Apply Industry Terminology
    if (this.config.industryTerminology) {
      result = this.applyIndustryTerminology(result);
    }

    // Step 5: Apply Tonality
    result = this.applyTonality(result);

    // Step 6: Apply Professional Level
    result = this.applyProfessionalLevel(result);

    return result;
  }

  private removeAIPhrases(text: string): string {
    const phrases = AI_PHRASES[this.config.language];
    let result = text;

    for (const phrase of phrases) {
      result = result.replace(phrase.pattern, phrase.replace);
    }

    return result;
  }

  private convertToActiveVoice(text: string): string {
    const patterns = this.config.language === 'de' ? PASSIVE_VOICE_DE : PASSIVE_VOICE_EN;
    let result = text;

    for (const pattern of patterns) {
      result = result.replace(pattern.pattern, pattern.replace);
    }

    return result;
  }

  private applySentenceVariation(text: string): string {
    // Split into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    if (sentences.length < 3) return text;

    // Vary sentence structure
    const varied: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      
      // Alternate between short and long sentences
      if (i % 3 === 0 && sentence.length > 150) {
        // Split long sentence
        const parts = sentence.split(/,\s+/);
        if (parts.length > 1) {
          varied.push(parts[0] + '.');
          varied.push(parts.slice(1).join(', ') + '.');
          continue;
        }
      }
      
      varied.push(sentence);
    }

    return varied.join(' ');
  }

  private applyIndustryTerminology(text: string): string {
    const terms = INDUSTRY_TERMS[this.config.language];
    let result = text;

    for (const [old, replacement] of Object.entries(terms)) {
      const pattern = new RegExp(`\\b${old}\\b`, 'gi');
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  private applyTonality(text: string): string {
    switch (this.config.tonality) {
      case 'formal':
        return this.applyFormalTone(text);
      case 'semi-formal':
        return this.applySemiFormalTone(text);
      case 'direct':
        return this.applyDirectTone(text);
      default:
        return text;
    }
  }

  private applyFormalTone(text: string): string {
    // Replace casual words with formal equivalents
    if (this.config.language === 'de') {
      return text
        .replace(/\baber\b/gi, 'jedoch')
        .replace(/\bviel\b/gi, 'erheblich')
        .replace(/\bkann\b/gi, 'kann möglicherweise');
    } else {
      return text
        .replace(/\bbut\b/gi, 'however')
        .replace(/\blot\b/gi, 'significant')
        .replace(/\bcan\b/gi, 'may potentially');
    }
  }

  private applySemiFormalTone(text: string): string {
    // Keep balanced tone
    return text;
  }

  private applyDirectTone(text: string): string {
    // Use direct, concise language
    if (this.config.language === 'de') {
      return text
        .replace(/Es ist möglich, dass/gi, 'Es kann')
        .replace(/Basierend auf/gi, 'Nach');
    } else {
      return text
        .replace(/It is possible that/gi, 'It may')
        .replace(/Based on/gi, 'After');
    }
  }

  private applyProfessionalLevel(text: string): string {
    switch (this.config.professionLevel) {
      case 'technical':
        return this.applyTechnicalLevel(text);
      case 'management':
        return this.applyManagementLevel(text);
      case 'mixed':
        return text; // Default mixed level
      default:
        return text;
    }
  }

  private applyTechnicalLevel(text: string): string {
    // Keep technical terms, add more precision
    if (this.config.language === 'de') {
      return text
        .replace(/Fehler/gi, 'Vulnerability')
        .replace(/Problem/gi, 'Issue');
    }
    return text;
  }

  private applyManagementLevel(text: string): string {
    // Simplify technical terms, focus on business impact
    if (this.config.language === 'de') {
      return text
        .replace(/CVE-\d+-\d+/gi, 'Sicherheitslücke')
        .replace(/Exploit/gi, 'Angriff')
        .replace(/Payload/gi, 'Angriffscode');
    } else {
      return text
        .replace(/CVE-\d+-\d+/gi, 'security flaw')
        .replace(/Exploit/gi, 'attack')
        .replace(/Payload/gi, 'attack code');
    }
  }

  /**
   * Get configuration
   */
  getConfig(): HumanizerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<HumanizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get preview of humanized text (before/after)
   */
  getPreview(text: string): { original: string; humanized: string } {
    return {
      original: text,
      humanized: this.humanize(text),
    };
  }
}

export const createHumanizer = (config?: Partial<HumanizerConfig>): HumanizerEngine => {
  return new HumanizerEngine(config);
};
