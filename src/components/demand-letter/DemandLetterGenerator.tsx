import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Eye, Edit3, Save, History, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PreviousLetters from "./PreviousLetters";

interface GeneratedLetter {
  id: string;
  plaintiffName: string;
  content: string;
  generatedAt: string;
  isEdited: boolean;
}

const DemandLetterGenerator = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [editableContent, setEditableContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedPlaintiff, setSelectedPlaintiff] = useState<number>(0);
  const [showPrevious, setShowPrevious] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for API key and template
    const apiKey = localStorage.getItem('openai_api_key');
    const template = localStorage.getItem('demandLetterTemplate');
    setHasApiKey(!!apiKey);
    setHasTemplate(!!template);
  }, []);

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .csv file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Read and parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = rows.slice(1).filter(row => row.trim()).map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      setCsvData(data);
      setCsvFile(file);
      setIsUploading(false);
      
      toast({
        title: "CSV Uploaded Successfully",
        description: `Loaded ${data.length} plaintiff records with ${headers.length} fields`
      });
    };
    
    reader.readAsText(file);
  };

  const generateDemandLetter = async () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in Settings first",
        variant: "destructive"
      });
      return;
    }

    const template = localStorage.getItem('demandLetterTemplate');
    if (!template) {
      toast({
        title: "No Template Found",
        description: "Please upload a template first",
        variant: "destructive"
      });
      return;
    }

    if (csvData.length === 0) {
      toast({
        title: "No CSV Data",
        description: "Please upload plaintiff data first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const plaintiff = csvData[selectedPlaintiff];
      const instructions = localStorage.getItem('ai_instructions') || '';
      
      // Create the prompt for OpenAI
      const prompt = `You are an AI assistant specialized in generating professional demand letters for legal proceedings.

Template File: ${template}
Instructions: ${instructions}

Plaintiff Data:
${Object.entries(plaintiff).map(([key, value]) => `${key}: ${value}`).join('\n')}

Please generate a professional demand letter using the uploaded template structure. Replace all placeholders with the appropriate data from the plaintiff information. Ensure the letter is legally sound, professionally formatted, and persuasive.

Important:
- Use formal legal language
- Structure the letter with clear sections
- Calculate damages appropriately
- Maintain professional tone throughout
- Ensure all placeholders are properly replaced

Generate the complete demand letter:`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in generating professional demand letters for legal proceedings. Generate complete, professional demand letters based on templates and plaintiff data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content || '';

      if (!generatedContent) {
        throw new Error('No content generated');
      }

      setGeneratedLetter(generatedContent);
      setEditableContent(generatedContent);
      setIsGenerating(false);
      
      toast({
        title: "Demand Letter Generated",
        description: "Letter generated successfully using AI processing"
      });

    } catch (error) {
      console.error('Error generating demand letter:', error);
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate demand letter. Please check your API key and try again.",
        variant: "destructive"
      });
    }
  };

  const saveLetter = () => {
    const savedLetters = JSON.parse(localStorage.getItem('savedDemandLetters') || '[]');
    const newLetter: GeneratedLetter = {
      id: Date.now().toString(),
      plaintiffName: csvData[selectedPlaintiff]?.plaintiff_name || csvData[selectedPlaintiff]?.name || 'Unknown',
      content: editableContent,
      generatedAt: new Date().toISOString(),
      isEdited: editableContent !== generatedLetter
    };
    
    savedLetters.push(newLetter);
    localStorage.setItem('savedDemandLetters', JSON.stringify(savedLetters));
    
    toast({
      title: "Letter Saved",
      description: "Demand letter has been saved to the system"
    });
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([editableContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `demand_letter_${csvData[selectedPlaintiff]?.plaintiff_name || 'client'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const canGenerate = hasApiKey && hasTemplate && csvData.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Generate Demand Letters</h2>
          <p className="text-gray-600">
            Upload plaintiff CSV data and generate AI-powered demand letters using your template
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPrevious} onOpenChange={setShowPrevious}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Previous Letters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Previous Demand Letters</DialogTitle>
                <DialogDescription>
                  Access and manage previously generated demand letters
                </DialogDescription>
              </DialogHeader>
              <PreviousLetters />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Requirements Status */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg border ${hasApiKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                <Key className={`h-4 w-4 ${hasApiKey ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${hasApiKey ? 'text-green-800' : 'text-red-800'}`}>
                  OpenAI API Key {hasApiKey ? '✓' : '✗'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${hasTemplate ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                <FileText className={`h-4 w-4 ${hasTemplate ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${hasTemplate ? 'text-green-800' : 'text-red-800'}`}>
                  Template Uploaded {hasTemplate ? '✓' : '✗'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${csvData.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                <Upload className={`h-4 w-4 ${csvData.length > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${csvData.length > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  CSV Data {csvData.length > 0 ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Data Upload
            </CardTitle>
            <CardDescription>
              Upload CSV file containing plaintiff information (supports 251-278 columns)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!csvFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="font-medium mb-1">Upload CSV File</p>
                <p className="text-sm text-gray-500 mb-3">Upload plaintiff data for processing</p>
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    disabled={isUploading}
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" disabled={isUploading} asChild>
                      <span>
                        {isUploading ? "Processing..." : "Choose CSV File"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{csvFile.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {setCsvFile(null); setCsvData([])}}>
                    Remove
                  </Button>
                </div>
                
                {csvData.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Plaintiff:</label>
                    <select 
                      value={selectedPlaintiff} 
                      onChange={(e) => setSelectedPlaintiff(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {csvData.map((plaintiff, index) => (
                        <option key={index} value={index}>
                          {plaintiff.plaintiff_name || plaintiff.name || `Plaintiff ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Letter Generation
            </CardTitle>
            <CardDescription>
              Generate demand letters using AI-powered template processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={generateDemandLetter}
                disabled={!canGenerate || isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating with AI..." : "Generate New Demand Letter"}
              </Button>
              
              {!canGenerate && (
                <p className="text-sm text-red-600">
                  Please ensure API key is configured, template is uploaded, and CSV data is loaded.
                </p>
              )}
              
              {generatedLetter && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    {isEditing ? "View Mode" : "Edit Mode"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveLetter}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Letter
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadLetter}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {generatedLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Demand Letter</CardTitle>
            <CardDescription>
              {isEditing ? "Edit the generated letter below" : "Preview of the generated demand letter"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Edit your demand letter content here..."
              />
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{editableContent}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DemandLetterGenerator;
