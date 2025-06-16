
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ThumbsUp, ThumbsDown, Zap, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PlaceholderMapper from "./PlaceholderMapper";
import { AILearningEngine } from "@/utils/aiLearningEngine";

interface EnhancedDemandGeneratorProps {
  csvData: any[];
  selectedPlaintiff: number;
}

const EnhancedDemandGenerator = ({ csvData, selectedPlaintiff }: EnhancedDemandGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [placeholderMappings, setPlaceholderMappings] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState({ totalGenerations: 0, successRate: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const template = localStorage.getItem('demandLetterTemplateContent');
    if (template) {
      setTemplateContent(template);
    }

    // Load learning statistics
    const learningData = AILearningEngine.getLearningData();
    const positiveCount = learningData.filter(d => d.userFeedback === 'positive').length;
    setLearningStats({
      totalGenerations: learningData.length,
      successRate: learningData.length > 0 ? (positiveCount / learningData.length) * 100 : 0
    });
  }, []);

  const generateEnhancedLetter = async () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in Settings",
        variant: "destructive"
      });
      return;
    }

    if (!templateContent) {
      toast({
        title: "No Template Found",
        description: "Please upload a template first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Convert mappings to simple object
      const mappingObject = placeholderMappings.reduce((acc, mapping) => {
        acc[mapping.placeholder] = mapping.value;
        return acc;
      }, {});

      // Generate enhanced prompt using AI learning
      const enhancedPrompt = AILearningEngine.generateEnhancedPrompt(templateContent, mappingObject);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a precise legal document processor. Your only job is to replace bracketed placeholders with provided values while preserving EXACT formatting. Do not modify any other content.'
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          temperature: 0,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content || '';

      setGeneratedLetter(generatedContent);
      setIsGenerating(false);

      // Save learning data
      AILearningEngine.saveLearningData({
        templateStructure: templateContent,
        placeholderMappings: mappingObject,
        generatedContent,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Enhanced Letter Generated",
        description: "Letter generated using AI learning patterns"
      });

    } catch (error) {
      console.error('Error generating letter:', error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate letter. Please try again.",
        variant: "destructive"
      });
    }
  };

  const provideFeedback = (feedback: 'positive' | 'negative') => {
    AILearningEngine.recordUserFeedback(templateContent, generatedLetter, feedback);
    
    // Update learning stats
    const learningData = AILearningEngine.getLearningData();
    const positiveCount = learningData.filter(d => d.userFeedback === 'positive').length;
    setLearningStats({
      totalGenerations: learningData.length,
      successRate: learningData.length > 0 ? (positiveCount / learningData.length) * 100 : 0
    });

    toast({
      title: "Feedback Recorded",
      description: `Thank you! This helps improve future generations.`,
    });
  };

  const currentClient = csvData[selectedPlaintiff] || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Enhanced AI Demand Letter Generator</h2>
          <p className="text-gray-600">
            Advanced placeholder recognition with auto-learning capabilities
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{learningStats.totalGenerations}</div>
            <div className="text-xs text-gray-600">Total Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{learningStats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* AI Learning Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Badge variant="outline" className="p-2 justify-center">
              Auto Placeholder Detection: Active
            </Badge>
            <Badge variant="outline" className="p-2 justify-center">
              Pattern Learning: {learningStats.totalGenerations > 0 ? 'Learning' : 'Ready'}
            </Badge>
            <Badge variant="outline" className="p-2 justify-center">
              Smart Mapping: Enhanced
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Smart Placeholder Mapping */}
      {templateContent && (
        <PlaceholderMapper
          templateContent={templateContent}
          onMappingUpdate={setPlaceholderMappings}
          csvData={currentClient}
        />
      )}

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Enhanced Demand Letter</CardTitle>
          <CardDescription>
            Using AI learning patterns and smart placeholder recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={generateEnhancedLetter}
              disabled={isGenerating || !templateContent || placeholderMappings.length === 0}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating with AI Learning..." : "Generate Enhanced Letter"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Letter Preview */}
      {generatedLetter && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Generated Demand Letter</CardTitle>
                <CardDescription>
                  Review and provide feedback to improve future generations
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => provideFeedback('positive')}>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Good
                </Button>
                <Button variant="outline" size="sm" onClick={() => provideFeedback('negative')}>
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Needs Work
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{generatedLetter}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDemandGenerator;
