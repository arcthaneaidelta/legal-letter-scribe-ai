
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
        
        // Extract both raw text and HTML for better formatting preservation
        const rawResult = await mammoth.extractRawText({ arrayBuffer });
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        
        // Store HTML version for better AI processing of formatting
        localStorage.setItem('demandLetterTemplateHTML', htmlResult.value);
        
        return rawResult.value;
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
      // Parse the template content with enhanced formatting detection
      const templateContent = await parseTemplateFile(file);
      
      setUploadedTemplate(file);
      setIsUploading(false);
      
      // Store template info and content in localStorage
      localStorage.setItem('demandLetterTemplate', file.name);
      localStorage.setItem('demandLetterTemplateContent', templateContent);
      localStorage.setItem('templateUploadDate', new Date().toISOString());
      
      toast({
        title: "Template Uploaded Successfully",
        description: "Template processed with enhanced formatting detection for precise AI replacement"
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
    localStorage.removeItem('demandLetterTemplateHTML');
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
          Upload your demand letter template in DOCX format. The AI will precisely identify highlighted sections and maintain exact template formatting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demand Letter Template
          </CardTitle>
          <CardDescription>
            Upload a .docx file containing your demand letter template. The AI will maintain exact formatting while only replacing highlighted content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedTemplate ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload Template</p>
                <p className="text-gray-500">Upload your .docx template for precise AI processing</p>
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
                  <p className="text-sm text-green-700">Template processed with enhanced formatting detection</p>
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
          <CardTitle>Enhanced AI Template Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Precise Template Adherence:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Maintains EXACT formatting, spacing, and document structure</p>
                <p>• Identifies highlighted text and bracketed placeholders for replacement</p>
                <p>• Preserves all legal language and clause structure</p>
                <p>• Intelligent field mapping from CSV data to template sections</p>
                <p>• Zero alteration to non-highlighted template content</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Template Best Practices:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Highlight text that needs replacement with CSV data</p>
                <p>• Use brackets for clear placeholders: [CLIENT NAME], [AMOUNT]</p>
                <p>• Maintain professional legal formatting throughout</p>
                <p>• Ensure highlighted sections clearly indicate required data</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Precision Processing:</strong> The enhanced AI system now maintains perfect template structure while only replacing clearly designated highlighted sections and placeholders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateUpload;
