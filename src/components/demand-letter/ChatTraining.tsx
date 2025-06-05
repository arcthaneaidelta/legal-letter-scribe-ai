
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, Brain, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TrainingDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
}

const ChatTraining = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingDocs, setTrainingDocs] = useState<TrainingDocument[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved chat history and training documents
    const savedChats = JSON.parse(localStorage.getItem('aiTrainingChats') || '[]');
    const savedDocs = JSON.parse(localStorage.getItem('trainingDocuments') || '[]');
    setChatHistory(savedChats);
    setTrainingDocs(savedDocs);
  }, []);

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload .txt or .docx files",
          variant: "destructive"
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newDoc: TrainingDocument = {
          id: Date.now().toString() + i,
          name: file.name,
          content: content,
          uploadedAt: new Date().toISOString()
        };

        const updatedDocs = [...trainingDocs, newDoc];
        setTrainingDocs(updatedDocs);
        localStorage.setItem('trainingDocuments', JSON.stringify(updatedDocs));
      };
      
      reader.readAsText(file);
    }

    toast({
      title: "Documents Uploaded",
      description: "Training documents have been added to the AI knowledge base"
    });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setMessage("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call OpenAI API)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(message, trainingDocs),
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...updatedHistory, aiResponse];
      setChatHistory(finalHistory);
      localStorage.setItem('aiTrainingChats', JSON.stringify(finalHistory));
      setIsLoading(false);

      // Update AI learning parameters based on conversation
      updateAILearning(message, aiResponse.content);
    }, 1500);
  };

  const generateAIResponse = (userMsg: string, docs: TrainingDocument[]): string => {
    const lowerMsg = userMsg.toLowerCase();
    
    if (lowerMsg.includes('formula') || lowerMsg.includes('calculation')) {
      return `I understand you want to discuss formulas for demand letter calculations. Based on the training documents (${docs.length} uploaded), I can help with:

1. Damage calculation formulas
2. Settlement amount recommendations
3. Pain and suffering multipliers
4. Medical expense calculations

Current formula recommendations:
- General damages = Medical expenses × 1.5 to 5 (depending on severity)
- Lost wages = (Daily wage × Days missed) + Future earning loss
- Pain and suffering = Medical expenses × Severity multiplier (1-5)

What specific formula would you like to refine?`;
    }
    
    if (lowerMsg.includes('template') || lowerMsg.includes('format')) {
      return `I can help improve the demand letter template structure. Based on your training data, I recommend:

1. **Header Section**: Date, parties, case reference
2. **Facts Section**: Incident description, liability establishment
3. **Damages Section**: Itemized damages with supporting documentation
4. **Demand Section**: Clear monetary demand with deadline
5. **Closing**: Professional conclusion with next steps

Would you like me to suggest specific language improvements for any section?`;
    }

    if (lowerMsg.includes('improve') || lowerMsg.includes('better')) {
      return `To improve demand letter generation, I'm analyzing patterns from ${docs.length} training documents and ${chatHistory.length} conversations. 

Key improvements identified:
- More personalized language based on case type
- Dynamic damage calculations
- Better liability arguments
- Stronger settlement demands

I'm continuously learning from each interaction. What specific aspect would you like me to focus on improving?`;
    }

    return `I'm learning from your input about demand letter generation. I have access to ${docs.length} training documents and ${chatHistory.length} previous conversations. 

I can help with:
- Refining letter language and tone
- Improving damage calculations
- Enhancing legal arguments
- Optimizing settlement strategies

How would you like me to improve the demand letter generation process?`;
  };

  const updateAILearning = (userInput: string, aiResponse: string) => {
    const learningData = {
      userInput,
      aiResponse,
      timestamp: new Date().toISOString(),
      context: 'training_chat'
    };

    const existingLearning = JSON.parse(localStorage.getItem('aiLearningData') || '[]');
    existingLearning.push(learningData);
    localStorage.setItem('aiLearningData', JSON.stringify(existingLearning));
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem('aiTrainingChats');
    toast({
      title: "Chat Cleared",
      description: "Training chat history has been cleared"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">AI Training & Learning</h2>
        <p className="text-gray-600">
          Train the AI to generate better demand letters through conversation and document uploads
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Training Documents
            </CardTitle>
            <CardDescription>
              Upload existing demand letters to train the AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload demand letters for training</p>
                <label>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {trainingDocs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Uploaded Documents ({trainingDocs.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {trainingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{doc.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Learning Status
            </CardTitle>
            <CardDescription>
              AI learning progress and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{trainingDocs.length}</div>
                  <div className="text-sm text-blue-800">Training Documents</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{chatHistory.length}</div>
                  <div className="text-sm text-green-800">Training Conversations</div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">AI Capabilities</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Template pattern recognition</li>
                  <li>✓ Damage calculation formulas</li>
                  <li>✓ Legal language optimization</li>
                  <li>✓ Case-specific customization</li>
                  <li>✓ Continuous learning from feedback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Training Chat
              </CardTitle>
              <CardDescription>
                Discuss improvements, formulas, and training with the AI
              </CardDescription>
            </div>
            {chatHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chatHistory.length > 0 && (
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about formulas, improvements, or provide training guidance..."
                className="min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!message.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoading && (
              <div className="text-center text-gray-500">
                AI is thinking...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatTraining;
