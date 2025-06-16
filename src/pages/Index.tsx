
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Settings, Upload, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface IndexProps {
  onLogout?: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {onLogout && (
          <div className="flex justify-end mb-8">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Demand Letter Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionary AI-powered platform for generating professional demand letters. 
            Upload templates, process plaintiff data, and create legally sound documents with intelligent automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Upload className="h-8 w-8 mx-auto text-blue-600" />
              <CardTitle>Template Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload DOCX templates and CSV plaintiff data for automated processing
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 mx-auto text-green-600" />
              <CardTitle>Smart Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI matches CSV data to template placeholders and generates demand letters
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Brain className="h-8 w-8 mx-auto text-purple-600" />
              <CardTitle>AI Training</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Train the AI with chat interactions and existing demand letters
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-8 w-8 mx-auto text-orange-600" />
              <CardTitle>Auto-Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Continuous improvement through machine learning and lawyer feedback
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/demand-letters">
            <Button size="lg" className="px-8 py-3 text-lg">
              Launch Application
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
