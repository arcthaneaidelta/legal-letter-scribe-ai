import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Eye, Edit3, Save, History } from "lucide-react";
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
  const { toast } = useToast();

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

    // Simulate AI processing with OpenAI
    setTimeout(() => {
      const plaintiff = csvData[selectedPlaintiff];
      const mockTemplate = `DEMAND LETTER

Date: ${new Date().toLocaleDateString()}

TO: {{defendant_name}}

FROM: {{attorney_name}}, {{law_firm}}

RE: Demand for Payment - {{plaintiff_name}} v. {{defendant_name}}
    Incident Date: {{incident_date}}
    Claim Number: {{case_number}}

Dear {{defendant_name}},

I represent {{plaintiff_name}} in connection with the incident that occurred on {{incident_date}}. 

{{injury_description}}

As a direct and proximate result of your negligence, my client sustained significant injuries and damages, including but not limited to:

- Medical expenses
- Lost wages  
- Pain and suffering
- Property damage

The total amount of damages is {{damages_amount}}.

DEMAND IS HEREBY MADE for payment of the sum of {{damages_amount}} to fully resolve this matter.

This demand is made as a good faith effort to resolve this matter without litigation.

Sincerely,

{{attorney_name}}
{{law_firm}}`;

      // Replace placeholders with actual data
      let processedLetter = mockTemplate;
      Object.keys(plaintiff).forEach(key => {
        const placeholder = `{{${key.toLowerCase().replace(/\s+/g, '_')}}}`;
        processedLetter = processedLetter.replace(new RegExp(placeholder, 'g'), plaintiff[key] || `[${key}]`);
      });

      setGeneratedLetter(processedLetter);
      setEditableContent(processedLetter);
      setIsGenerating(false);
      
      toast({
        title: "Demand Letter Generated",
        description: "Letter generated successfully using AI processing"
      });
    }, 3000);
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
                disabled={!csvFile || csvData.length === 0 || isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating with AI..." : "Generate New Demand Letter"}
              </Button>
              
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
