
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Key, Brain, Save, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const savedKey = localStorage.getItem('openai_api_key');
    const savedInstructions = localStorage.getItem('ai_instructions');
    const savedAutoLearn = localStorage.getItem('auto_learn_enabled');
    
    if (savedKey) {
      setOpenaiApiKey('sk-...' + savedKey.slice(-8)); // Show masked key
      setIsKeySaved(true);
    }
    
    if (savedInstructions) {
      setAiInstructions(savedInstructions);
    } else {
      setAiInstructions(`You are an AI assistant specialized in generating professional demand letters for legal proceedings. 

Key guidelines:
1. Use formal, professional legal language
2. Structure letters with clear sections: header, facts, damages, demand, conclusion
3. Calculate damages using provided formulas and case data
4. Maintain consistency with uploaded templates
5. Learn from lawyer feedback and training conversations
6. Ensure all placeholders are properly replaced with CSV data
7. Apply jurisdiction-specific legal standards when relevant

Focus on generating persuasive, well-structured demand letters that maximize settlement potential while maintaining legal accuracy.`);
    }

    if (savedAutoLearn !== null) {
      setAutoLearnEnabled(savedAutoLearn === 'true');
    }
  }, []);

  const saveApiKey = () => {
    if (!openaiApiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    if (!openaiApiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key Format",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('openai_api_key', openaiApiKey);
    setIsKeySaved(true);
    setOpenaiApiKey('sk-...' + openaiApiKey.slice(-8)); // Mask the key
    
    toast({
      title: "API Key Saved",
      description: "OpenAI API key has been securely saved"
    });
  };

  const updateApiKey = () => {
    setOpenaiApiKey("");
    setIsKeySaved(false);
    localStorage.removeItem('openai_api_key');
  };

  const saveInstructions = () => {
    localStorage.setItem('ai_instructions', aiInstructions);
    toast({
      title: "Instructions Saved",
      description: "AI instructions have been updated"
    });
  };

  const toggleAutoLearn = () => {
    const newValue = !autoLearnEnabled;
    setAutoLearnEnabled(newValue);
    localStorage.setItem('auto_learn_enabled', newValue.toString());
    
    toast({
      title: autoLearnEnabled ? "Auto-Learning Disabled" : "Auto-Learning Enabled",
      description: autoLearnEnabled 
        ? "AI will no longer automatically learn from interactions" 
        : "AI will automatically improve from user interactions"
    });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) {
      localStorage.removeItem('demandLetterTemplate');
      localStorage.removeItem('savedDemandLetters');
      localStorage.removeItem('aiTrainingChats');
      localStorage.removeItem('trainingDocuments');
      localStorage.removeItem('aiLearningData');
      
      toast({
        title: "Data Cleared",
        description: "All application data has been cleared"
      });
    }
  };

  const exportData = () => {
    const allData = {
      template: localStorage.getItem('demandLetterTemplate'),
      letters: localStorage.getItem('savedDemandLetters'),
      chats: localStorage.getItem('aiTrainingChats'),
      documents: localStorage.getItem('trainingDocuments'),
      learningData: localStorage.getItem('aiLearningData'),
      instructions: localStorage.getItem('ai_instructions'),
      exportDate: new Date().toISOString()
    };

    const dataBlob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demand_letter_app_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Application data has been exported successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Application Settings</h2>
        <p className="text-gray-600">
          Configure API keys, AI behavior, and application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Configuration
          </CardTitle>
          <CardDescription>
            Configure your OpenAI API key for AI-powered demand letter generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="api-key"
                type={isKeySaved ? "password" : "text"}
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                disabled={isKeySaved}
              />
              {isKeySaved ? (
                <Button variant="outline" onClick={updateApiKey}>
                  Update
                </Button>
              ) : (
                <Button onClick={saveApiKey}>
                  Save
                </Button>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your API key is stored locally in your browser and is never sent to our servers. 
              It's only used to communicate directly with OpenAI's API.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Behavior Settings
          </CardTitle>
          <CardDescription>
            Customize how the AI generates and improves demand letters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-instructions">AI Instructions</Label>
            <Textarea
              id="ai-instructions"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className="min-h-[200px] mt-1"
              placeholder="Enter instructions for how the AI should behave..."
            />
            <Button onClick={saveInstructions} className="mt-2" size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save Instructions
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Auto-Learning</h4>
              <p className="text-sm text-gray-600">
                Allow AI to automatically learn and improve from user interactions
              </p>
            </div>
            <Button 
              variant={autoLearnEnabled ? "default" : "outline"}
              onClick={toggleAutoLearn}
            >
              {autoLearnEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your application data and backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={exportData}>
              Export Data
            </Button>
            <Button variant="destructive" onClick={clearAllData}>
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {JSON.parse(localStorage.getItem('savedDemandLetters') || '[]').length}
              </div>
              <div className="text-sm text-blue-800">Generated Letters</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {JSON.parse(localStorage.getItem('aiTrainingChats') || '[]').length}
              </div>
              <div className="text-sm text-green-800">Training Chats</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {JSON.parse(localStorage.getItem('trainingDocuments') || '[]').length}
              </div>
              <div className="text-sm text-purple-800">Training Docs</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {JSON.parse(localStorage.getItem('aiLearningData') || '[]').length}
              </div>
              <div className="text-sm text-orange-800">Learning Points</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
