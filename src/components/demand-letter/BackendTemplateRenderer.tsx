
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Zap } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";

const BackendTemplateRenderer = () => {
  const [templateData, setTemplateData] = useState('');
  const [fileId, setFileId] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderedTemplate, setRenderedTemplate] = useState('');
  const [renderingFileId, setRenderingFileId] = useState('');

  const handleRenderTemplate = async () => {
    if (!templateData.trim()) {
      toast.error('Please provide template data');
      return;
    }

    setIsRendering(true);

    try {
      const response = await apiService.renderTemplate({
        template: templateData,
        data: {}
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      setRenderingFileId(response.file_id || response.id);
      toast.success('Template rendering started!');
      
    } catch (error) {
      toast.error('Template rendering failed');
    } finally {
      setIsRendering(false);
    }
  };

  const handleGetRenderedTemplate = async () => {
    if (!fileId.trim()) {
      toast.error('Please provide a file ID');
      return;
    }

    try {
      const response = await apiService.getRenderedTemplate(fileId);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      setRenderedTemplate(response.rendered_content || JSON.stringify(response, null, 2));
      toast.success('Rendered template retrieved!');
      
    } catch (error) {
      toast.error('Failed to get rendered template');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Rendering
          </CardTitle>
          <CardDescription>
            Render templates using the backend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateData">Template Data (JSON)</Label>
            <Textarea
              id="templateData"
              placeholder="Enter template data in JSON format..."
              value={templateData}
              onChange={(e) => setTemplateData(e.target.value)}
              rows={8}
            />
          </div>

          <Button
            onClick={handleRenderTemplate}
            disabled={isRendering}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isRendering ? 'Rendering...' : 'Render Template'}
          </Button>

          {renderingFileId && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm">
                <strong>Rendering File ID:</strong> {renderingFileId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get Rendered Template</CardTitle>
          <CardDescription>
            Retrieve a previously rendered template by file ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileId">File ID</Label>
            <Input
              id="fileId"
              placeholder="Enter file ID..."
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
            />
          </div>

          <Button onClick={handleGetRenderedTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Get Rendered Template
          </Button>

          {renderedTemplate && (
            <div className="space-y-2">
              <Label>Rendered Template</Label>
              <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{renderedTemplate}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendTemplateRenderer;
