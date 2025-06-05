
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Eye, Trash2, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SavedLetter {
  id: string;
  plaintiffName: string;
  content: string;
  generatedAt: string;
  isEdited: boolean;
}

const PreviousLetters = () => {
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<SavedLetter | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const letters = JSON.parse(localStorage.getItem('savedDemandLetters') || '[]');
    setSavedLetters(letters.reverse()); // Show newest first
  }, []);

  const deleteLetter = (id: string) => {
    const updatedLetters = savedLetters.filter(letter => letter.id !== id);
    setSavedLetters(updatedLetters);
    localStorage.setItem('savedDemandLetters', JSON.stringify(updatedLetters.reverse()));
    toast({
      title: "Letter Deleted",
      description: "Demand letter has been removed from the system"
    });
  };

  const downloadLetter = (letter: SavedLetter) => {
    const element = document.createElement('a');
    const file = new Blob([letter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `demand_letter_${letter.plaintiffName}_${letter.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (savedLetters.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Letters</h3>
        <p className="text-gray-500">Generate and save demand letters to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Saved Demand Letters</h3>
        <p className="text-gray-600 text-sm">Manage your previously generated demand letters</p>
      </div>

      <div className="grid gap-4">
        {savedLetters.map((letter) => (
          <Card key={letter.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{letter.plaintiffName}</CardTitle>
                  <CardDescription>
                    Generated: {new Date(letter.generatedAt).toLocaleDateString()} at{' '}
                    {new Date(letter.generatedAt).toLocaleTimeString()}
                    {letter.isEdited && (
                      <span className="ml-2 text-blue-600 font-medium">(Edited)</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLetter(letter)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Demand Letter - {letter.plaintiffName}</DialogTitle>
                        <DialogDescription>
                          Generated on {new Date(letter.generatedAt).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-gray-50 p-6 rounded-lg border max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{letter.content}</pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" onClick={() => downloadLetter(letter)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => deleteLetter(letter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-2">
                {letter.content.substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PreviousLetters;
