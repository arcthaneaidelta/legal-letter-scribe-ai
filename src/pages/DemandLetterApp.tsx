
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TemplateUpload from "@/components/demand-letter/TemplateUpload";
import DemandLetterGenerator from "@/components/demand-letter/DemandLetterGenerator";
import EnhancedDemandGenerator from "@/components/demand-letter/EnhancedDemandGenerator";
import ChatTraining from "@/components/demand-letter/ChatTraining";
import Settings from "@/components/demand-letter/Settings";
import BackendExcelUpload from "@/components/demand-letter/BackendExcelUpload";
import BackendTemplateRenderer from "@/components/demand-letter/BackendTemplateRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const DemandLetterApp = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedPlaintiff, setSelectedPlaintiff] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Demand Letter Generator
                </h1>
                <p className="text-gray-600 text-sm">
                  Professional legal document automation platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-6">
          <Tabs defaultValue="backend-excel" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="backend-excel">Backend Excel</TabsTrigger>
              <TabsTrigger value="backend-render">Backend Render</TabsTrigger>
              <TabsTrigger value="template">Template Upload</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced Generator</TabsTrigger>
              <TabsTrigger value="generator">Standard Generator</TabsTrigger>
              <TabsTrigger value="training">AI Training</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="backend-excel" className="mt-6">
              <BackendExcelUpload />
            </TabsContent>

            <TabsContent value="backend-render" className="mt-6">
              <BackendTemplateRenderer />
            </TabsContent>

            <TabsContent value="template" className="mt-6">
              <TemplateUpload />
            </TabsContent>

            <TabsContent value="enhanced" className="mt-6">
              <EnhancedDemandGenerator 
                csvData={csvData}
                selectedPlaintiff={selectedPlaintiff}
              />
            </TabsContent>

            <TabsContent value="generator" className="mt-6">
              <DemandLetterGenerator />
            </TabsContent>

            <TabsContent value="training" className="mt-6">
              <ChatTraining />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Settings />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default DemandLetterApp;
