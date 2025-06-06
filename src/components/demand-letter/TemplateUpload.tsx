
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as mammoth from 'mammoth';

const TemplateUpload = () => {
  const [uploadedTemplate, setUploadedTemplate] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTemplate = localStorage.getItem('demandLetterTemplate');
    if (savedTemplate) {
      const mockFile = new File([''], savedTemplate, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      setUploadedTemplate(mockFile);
    }
  }, []);

  const parseTemplateFile = async (file: File): Promise<string> => {
    if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX template');
      }
    }
    throw new Error('Unsupported file format');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .docx file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Parse the template content
      const templateContent = await parseTemplateFile(file);
      
      setUploadedTemplate(file);
      setIsUploading(false);
      
      // Store template info and content in localStorage
      localStorage.setItem('demandLetterTemplate', file.name);
      localStorage.setItem('demandLetterTemplateContent', templateContent);
      localStorage.setItem('templateUploadDate', new Date().toISOString());
      
      toast({
        title: "Template Uploaded Successfully",
        description: "Your demand letter template has been parsed and is ready for use"
      });
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to parse the template file. Please ensure it's a valid DOCX file.",
        variant: "destructive"
      });
    }
  };

  const removeTemplate = () => {
    setUploadedTemplate(null);
    localStorage.removeItem('demandLetterTemplate');
    localStorage.removeItem('demandLetterTemplateContent');
    localStorage.removeItem('templateUploadDate');
    toast({
      title: "Template Removed",
      description: "Template has been removed from the system"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Template Management</h2>
        <p className="text-gray-600">
          Upload your demand letter template in DOCX format. The AI will intelligently identify and replace placeholders and highlighted sections with CSV data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demand Letter Template
          </CardTitle>
          <CardDescription>
            Upload a .docx file containing your demand letter template. The AI will parse the document and identify areas for data replacement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedTemplate ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload Template</p>
                <p className="text-gray-500">Upload your .docx template for AI processing</p>
              </div>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                  id="template-upload"
                />
                <label htmlFor="template-upload" className="cursor-pointer">
                  <Button variant="outline" className="cursor-pointer" disabled={isUploading} asChild>
                    <span>
                      {isUploading ? "Processing Template..." : "Choose DOCX File"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{uploadedTemplate.name}</p>
                  <p className="text-sm text-green-700">Template parsed and ready for AI generation</p>
                </div>
              </div>
              <Button variant="outline" onClick={removeTemplate} size="sm">
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Template Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How AI Processes Your Template:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Automatically identifies highlighted text that needs replacement</p>
                <p>• Recognizes common placeholder patterns and bracketed text</p>
                <p>• Intelligently maps CSV fields to appropriate template sections</p>
                <p>• Maintains exact formatting, structure, and legal language</p>
                <p>• Calculates damages and monetary amounts based on available data</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Template Best Practices:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use highlighting or brackets for areas requiring data replacement</p>
                <p>• Include placeholder text like [CLIENT NAME] or [AMOUNT]</p>
                <p>• Maintain professional legal formatting and structure</p>
                <p>• Include sections for damages, dates, and contact information</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>AI Enhancement:</strong> The system uses advanced AI to understand your template structure and intelligently replace content while preserving formatting and legal accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateUpload;
