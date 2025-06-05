
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TemplateUpload from "@/components/demand-letter/TemplateUpload";
import DemandLetterGenerator from "@/components/demand-letter/DemandLetterGenerator";
import ChatTraining from "@/components/demand-letter/ChatTraining";
import Settings from "@/components/demand-letter/Settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DemandLetterApp = () => {
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
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">Template Upload</TabsTrigger>
              <TabsTrigger value="generator">Generate Letters</TabsTrigger>
              <TabsTrigger value="training">AI Training</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="mt-6">
              <TemplateUpload />
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
