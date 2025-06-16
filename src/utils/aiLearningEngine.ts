interface LearningData {
  templateStructure: string;
  placeholderMappings: { [key: string]: string };
  generatedContent: string;
  userFeedback?: 'positive' | 'negative';
  timestamp: string;
  improvementNotes?: string;
}

interface TemplatePattern {
  placeholders: string[];
  structure: string;
  commonMappings: { [key: string]: string[] };
  successRate: number;
  usageCount: number;
}

export class AILearningEngine {
  private static LEARNING_DATA_KEY = 'aiLearningDatabase';
  private static TEMPLATE_PATTERNS_KEY = 'templatePatterns';

  static saveLearningData(data: LearningData) {
    const existingData = this.getLearningData();
    existingData.push(data);
    
    // Keep only last 1000 entries to manage storage
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    localStorage.setItem(this.LEARNING_DATA_KEY, JSON.stringify(existingData));
    this.updateTemplatePatterns(data);
  }

  static getLearningData(): LearningData[] {
    return JSON.parse(localStorage.getItem(this.LEARNING_DATA_KEY) || '[]');
  }

  static updateTemplatePatterns(data: LearningData) {
    const patterns = this.getTemplatePatterns();
    const placeholders = this.extractPlaceholders(data.templateStructure);
    const patternKey = placeholders.sort().join('|');
    
    if (patterns[patternKey]) {
      patterns[patternKey].usageCount++;
      if (data.userFeedback === 'positive') {
        patterns[patternKey].successRate = 
          (patterns[patternKey].successRate * (patterns[patternKey].usageCount - 1) + 1) / 
          patterns[patternKey].usageCount;
      }
      
      // Update common mappings
      Object.entries(data.placeholderMappings).forEach(([placeholder, value]) => {
        if (!patterns[patternKey].commonMappings[placeholder]) {
          patterns[patternKey].commonMappings[placeholder] = [];
        }
        if (!patterns[patternKey].commonMappings[placeholder].includes(value)) {
          patterns[patternKey].commonMappings[placeholder].push(value);
        }
      });
    } else {
      patterns[patternKey] = {
        placeholders,
        structure: data.templateStructure,
        commonMappings: { ...data.placeholderMappings },
        successRate: data.userFeedback === 'positive' ? 1 : 0.5,
        usageCount: 1
      };
    }
    
    localStorage.setItem(this.TEMPLATE_PATTERNS_KEY, JSON.stringify(patterns));
  }

  static getTemplatePatterns(): { [key: string]: TemplatePattern } {
    return JSON.parse(localStorage.getItem(this.TEMPLATE_PATTERNS_KEY) || '{}');
  }

  static extractPlaceholders(template: string): string[] {
    const placeholderRegex = /\[([^\]]+)\]/g;
    const matches = template.match(placeholderRegex) || [];
    return [...new Set(matches)];
  }

  static generateEnhancedPrompt(templateContent: string, mappings: { [key: string]: string }): string {
    const learningData = this.getLearningData();
    const patterns = this.getTemplatePatterns();
    const currentPlaceholders = this.extractPlaceholders(templateContent);
    
    // Find similar successful patterns
    const successfulPatterns = Object.values(patterns)
      .filter(pattern => pattern.successRate > 0.7)
      .sort((a, b) => b.successRate - a.successRate);

    let enhancedInstructions = '';
    
    if (successfulPatterns.length > 0) {
      enhancedInstructions = `
LEARNED BEST PRACTICES (from ${learningData.length} previous generations):
${successfulPatterns.slice(0, 3).map(pattern => 
  `- Success rate: ${(pattern.successRate * 100).toFixed(1)}% for similar templates`
).join('\n')}

CRITICAL FORMATTING RULES (learned from successful generations):
1. NEVER modify text outside of bracketed placeholders [LIKE THIS]
2. Preserve ALL spacing, line breaks, and paragraph structure EXACTLY
3. Replace ONLY the bracketed content, keeping brackets removed
4. Maintain all legal citations, headers, and section formatting
5. Keep all punctuation and capitalization as originally formatted
`;
    }

    return `${enhancedInstructions}

You are a legal document processor with advanced pattern recognition. Your ONLY task is to replace bracketed placeholders with provided values while preserving EXACT formatting.

TEMPLATE TO PROCESS:
${templateContent}

REPLACEMENT VALUES:
${Object.entries(mappings).map(([placeholder, value]) => 
  `${placeholder} → "${value}"`
).join('\n')}

PROCESSING INSTRUCTIONS:
- Find each bracketed placeholder [PLACEHOLDER] in the template
- Replace it with the corresponding value, removing the brackets
- If no value is provided for a placeholder, leave it as [PLACEHOLDER]
- Preserve ALL other text, formatting, spacing, and structure EXACTLY
- Do not add, remove, or modify any other content

Generate the complete processed document:`;
  }

  static recordUserFeedback(templateContent: string, generatedContent: string, feedback: 'positive' | 'negative', notes?: string) {
    const learningData: LearningData = {
      templateStructure: templateContent,
      placeholderMappings: {},
      generatedContent,
      userFeedback: feedback,
      timestamp: new Date().toISOString(),
      improvementNotes: notes
    };
    
    this.saveLearningData(learningData);
  }

  static getImprovementSuggestions(): string[] {
    const data = this.getLearningData();
    const negativeFeedback = data.filter(d => d.userFeedback === 'negative');
    
    const suggestions = [];
    
    if (negativeFeedback.length > 0) {
      suggestions.push("Consider reviewing placeholder naming conventions for better auto-mapping");
      suggestions.push("Ensure template formatting is consistent with legal standards");
      suggestions.push("Verify all required fields are properly bracketed in template");
    }
    
    const patterns = this.getTemplatePatterns();
    const lowSuccessPatterns = Object.values(patterns).filter(p => p.successRate < 0.5);
    
    if (lowSuccessPatterns.length > 0) {
      suggestions.push("Some template patterns have low success rates - consider template refinement");
    }
    
    return suggestions;
  }
}
