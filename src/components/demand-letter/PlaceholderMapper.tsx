
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaceholderMapping {
  placeholder: string;
  value: string;
  category: 'personal' | 'employment' | 'financial' | 'dates' | 'other';
}

interface PlaceholderMapperProps {
  templateContent: string;
  onMappingUpdate: (mappings: PlaceholderMapping[]) => void;
  csvData?: any;
}

const PlaceholderMapper = ({ templateContent, onMappingUpdate, csvData }: PlaceholderMapperProps) => {
  const [mappings, setMappings] = useState<PlaceholderMapping[]>([]);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Extract all bracketed placeholders from template
    const placeholderRegex = /\[([^\]]+)\]/g;
    const matches = templateContent.match(placeholderRegex) || [];
    const uniquePlaceholders = [...new Set(matches)];
    setDetectedPlaceholders(uniquePlaceholders);

    // Auto-map from CSV data if available
    const initialMappings = uniquePlaceholders.map(placeholder => {
      const cleanPlaceholder = placeholder.replace(/[\[\]]/g, '');
      let value = '';
      let category: PlaceholderMapping['category'] = 'other';

      // Smart mapping logic
      if (csvData) {
        value = findBestMatch(cleanPlaceholder, csvData) || '';
      }

      // Categorize placeholders
      if (cleanPlaceholder.toLowerCase().includes('name') || cleanPlaceholder.toLowerCase().includes('plaintiff')) {
        category = 'personal';
      } else if (cleanPlaceholder.toLowerCase().includes('job') || cleanPlaceholder.toLowerCase().includes('title') || cleanPlaceholder.toLowerCase().includes('position')) {
        category = 'employment';
      } else if (cleanPlaceholder.toLowerCase().includes('pay') || cleanPlaceholder.toLowerCase().includes('salary') || cleanPlaceholder.toLowerCase().includes('rate')) {
        category = 'financial';
      } else if (cleanPlaceholder.toLowerCase().includes('date') || cleanPlaceholder.toLowerCase().includes('start') || cleanPlaceholder.toLowerCase().includes('end')) {
        category = 'dates';
      }

      return {
        placeholder,
        value,
        category
      };
    });

    setMappings(initialMappings);
    onMappingUpdate(initialMappings);
  }, [templateContent, csvData]);

  const findBestMatch = (placeholder: string, data: any): string => {
    const lowerPlaceholder = placeholder.toLowerCase();
    
    // Direct matches
    const directMatches: { [key: string]: string[] } = {
      'plaintiff full name': ['Client_Name__c', 'plaintiff_name', 'full_name', 'name'],
      'defendant name': ['defendant_name', 'company_name', 'employer_name'],
      'start date': ['start_date', 'hire_date', 'employment_start'],
      'end date': ['end_date', 'termination_date', 'employment_end'],
      'job title': ['job_title', 'position', 'title'],
      'pay rate': ['pay_rate', 'hourly_rate', 'salary', 'wage'],
      'salary type': ['salary_type', 'pay_type', 'compensation_type']
    };

    // Check for direct matches first
    for (const [key, fields] of Object.entries(directMatches)) {
      if (lowerPlaceholder.includes(key)) {
        for (const field of fields) {
          if (data[field]) return data[field];
        }
      }
    }

    // Fuzzy matching
    const dataKeys = Object.keys(data);
    for (const key of dataKeys) {
      const lowerKey = key.toLowerCase();
      if (lowerPlaceholder.includes(lowerKey) || lowerKey.includes(lowerPlaceholder)) {
        return data[key];
      }
    }

    return '';
  };

  const updateMapping = (index: number, value: string) => {
    const updatedMappings = [...mappings];
    updatedMappings[index].value = value;
    setMappings(updatedMappings);
    onMappingUpdate(updatedMappings);
  };

  const saveMappingTemplate = () => {
    const mappingTemplate = mappings.reduce((acc, mapping) => {
      acc[mapping.placeholder] = {
        category: mapping.category,
        lastValue: mapping.value,
        frequency: 1
      };
      return acc;
    }, {} as any);

    const existingTemplates = JSON.parse(localStorage.getItem('placeholderMappingTemplates') || '{}');
    const templateKey = `template_${Date.now()}`;
    existingTemplates[templateKey] = mappingTemplate;
    localStorage.setItem('placeholderMappingTemplates', JSON.stringify(existingTemplates));

    toast({
      title: "Mapping Template Saved",
      description: "Placeholder mappings saved for future auto-learning"
    });
  };

  const autoLearnFromPrevious = () => {
    const savedTemplates = JSON.parse(localStorage.getItem('placeholderMappingTemplates') || '{}');
    const updatedMappings = mappings.map(mapping => {
      // Find similar placeholder in saved templates
      for (const template of Object.values(savedTemplates) as any[]) {
        if (template[mapping.placeholder]) {
          return {
            ...mapping,
            value: mapping.value || template[mapping.placeholder].lastValue || ''
          };
        }
      }
      return mapping;
    });

    setMappings(updatedMappings);
    onMappingUpdate(updatedMappings);

    toast({
      title: "Auto-Learning Applied",
      description: "Applied previous mapping patterns to current template"
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'employment': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'dates': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Smart Placeholder Mapping</CardTitle>
            <CardDescription>
              Detected {detectedPlaceholders.length} placeholders in your template
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={autoLearnFromPrevious}>
              <Brain className="h-4 w-4 mr-1" />
              Auto-Learn
            </Button>
            <Button variant="outline" size="sm" onClick={saveMappingTemplate}>
              <Save className="h-4 w-4 mr-1" />
              Save Pattern
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappings.map((mapping, index) => (
            <div key={mapping.placeholder} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getCategoryColor(mapping.category)}>
                  {mapping.category}
                </Badge>
                <Label className="font-mono text-sm">{mapping.placeholder}</Label>
              </div>
              <div className="md:col-span-2">
                <Input
                  value={mapping.value}
                  onChange={(e) => updateMapping(index, e.target.value)}
                  placeholder={`Enter value for ${mapping.placeholder}`}
                  className="w-full"
                />
              </div>
            </div>
          ))}
          
          {mappings.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No placeholders detected in template.</p>
              <p className="text-sm">Make sure your template uses brackets like [PLACEHOLDER NAME]</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderMapper;
