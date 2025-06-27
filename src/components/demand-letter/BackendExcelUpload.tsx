
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";

const BackendExcelUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        toast.success('Excel file selected successfully');
      } else {
        toast.error('Please select a valid Excel (.xlsx) file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await apiService.uploadExcel(file);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      setFileId(response.file_id);
      setUploadProgress(100);
      toast.success('File uploaded successfully!');
      
      // Start checking file status
      checkFileStatus(response.file_id);
      
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const checkFileStatus = async (id: string) => {
    try {
      const response = await apiService.checkFileStatus(id);
      
      if (response.data) {
        setFileStatus(response.data.status);
        
        if (response.data.status === 'completed') {
          toast.success('File processing completed!');
        } else if (response.data.status === 'processing') {
          // Continue checking status
          setTimeout(() => checkFileStatus(id), 2000);
        } else if (response.data.status === 'failed') {
          toast.error('File processing failed');
        }
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Backend Excel Upload
          </CardTitle>
          <CardDescription>
            Upload Excel files to the backend for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload to Backend'}
          </Button>

          {fileId && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">File ID: {fileId}</span>
              </div>
              
              {fileStatus && (
                <div className="flex items-center gap-2">
                  {fileStatus === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : fileStatus === 'failed' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  )}
                  <span className="capitalize">Status: {fileStatus}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendExcelUpload;
