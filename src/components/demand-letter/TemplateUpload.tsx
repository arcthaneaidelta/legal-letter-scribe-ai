
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TemplateUpload = () => {
  const [uploadedTemplate, setUploadedTemplate] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTemplate = localStorage.getItem('demandLetterTemplate');
    if (savedTemplate) {
      // Create a mock file object for display
      const mockFile = new File([''], savedTemplate, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      setUploadedTemplate(mockFile);
    }
  }, []);

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
    
    // Simulate processing the template
    setTimeout(() => {
      setUploadedTemplate(file);
      setIsUploading(false);
      
      // Store template info in localStorage
      localStorage.setItem('demandLetterTemplate', file.name);
      localStorage.setItem('templateUploadDate', new Date().toISOString());
      
      toast({
        title: "Template Uploaded Successfully",
        description: "Your demand letter template is ready for use"
      });
    }, 2000);
  };

  const removeTemplate = () => {
    setUploadedTemplate(null);
    localStorage.removeItem('demandLetterTemplate');
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
          Upload your demand letter template in DOCX format. Use placeholders like {"{{"} plaintiff_name {"}}"},  {"{{"} defendant_name {"}}"},  etc. for dynamic content replacement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demand Letter Template
          </CardTitle>
          <CardDescription>
            Upload a .docx file containing your demand letter template with placeholders for dynamic content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedTemplate ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload Template</p>
                <p className="text-gray-500">Drag and drop your .docx template or click to browse</p>
              </div>
              <label className="mt-4 inline-block">
                <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                  {isUploading ? "Processing..." : "Choose File"}
                </Button>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{uploadedTemplate.name}</p>
                  <p className="text-sm text-green-700">Template ready for letter generation</p>
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
          <CardTitle>Template Placeholder Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Supported Placeholder Format:</h4>
              <p className="text-sm text-gray-600 mb-3">Use double curly braces for placeholders: <code className="bg-gray-100 px-2 py-1 rounded">{"{{"} placeholder_name {"}}"}  </code></p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Common Placeholders:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• {"{{"} plaintiff_name {"}}"}  - Plaintiff's full name</div>
                <div>• {"{{"} defendant_name {"}}"}  - Defendant's full name</div>
                <div>• {"{{"} incident_date {"}}"}  - Date of incident</div>
                <div>• {"{{"} damages_amount {"}}"}  - Monetary damages</div>
                <div>• {"{{"} attorney_name {"}}"}  - Attorney's name</div>
                <div>• {"{{"} law_firm {"}}"}  - Law firm name</div>
                <div>• {"{{"} case_number {"}}"}  - Case reference number</div>
                <div>• {"{{"} injury_description {"}}"}  - Description of injuries</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The AI will automatically match CSV column headers to these placeholders when generating demand letters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateUpload;
