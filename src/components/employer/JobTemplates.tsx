
import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobTemplate {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  requirements?: string;
  field: string;
  description?: string;
  education?: string;
}

interface JobTemplatesProps {
  onSelectTemplate: (template: JobTemplate) => void;
  onClose: () => void;
}

const JobTemplates = ({ onSelectTemplate, onClose }: JobTemplatesProps) => {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<JobTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const { toast } = useToast();
  const [uniqueFields, setUniqueFields] = useState<string[]>([]);

  useEffect(() => {
    fetchJobTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, selectedField, templates]);

  const fetchJobTemplates = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .order('field');

      if (error) throw error;
      
      if (data) {
        setTemplates(data);
        setFilteredTemplates(data);
        
        const fields = [...new Set(data.map(template => template.field))];
        setUniqueFields(fields);
      }
    } catch (error: any) {
      console.error("Error fetching job templates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job templates.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(term) ||
        template.company.toLowerCase().includes(term) ||
        template.field.toLowerCase().includes(term)
      );
    }
    
    if (selectedField) {
      filtered = filtered.filter(template => template.field === selectedField);
    }
    
    setFilteredTemplates(filtered);
  };

  const handleSelectField = (field: string) => {
    setSelectedField(prev => prev === field ? null : field);
  };

  const handleSelectTemplate = (template: JobTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template Selected",
      description: `${template.title} template has been applied.`,
    });
    onClose(); // Close the dialog after selection
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Templates</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by title, company, or field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Filter by Field</Label>
          <div className="flex flex-wrap gap-2">
            {uniqueFields.map(field => (
              <Button
                key={field}
                variant={selectedField === field ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectField(field)}
                className="text-xs"
              >
                {field}
              </Button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{template.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template);
                      }}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="sr-only">Select template</span>
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{template.company} • {template.location}</p>
                </CardHeader>
                <CardContent className="text-sm">
                  {template.salary && <p className="mb-2 font-medium">{template.salary}</p>}
                  
                  {template.description && (
                    <div className="mb-2">
                      <p className="font-medium mb-1">Description:</p>
                      <div className="whitespace-pre-line text-muted-foreground text-xs">
                        {template.description}
                      </div>
                    </div>
                  )}
                  
                  {template.requirements && (
                    <div className="mb-2">
                      <p className="font-medium mb-1">Requirements:</p>
                      <div className="whitespace-pre-line text-muted-foreground text-xs">
                        {template.requirements}
                      </div>
                    </div>
                  )}
                  
                  {template.education && (
                    <div className="mb-2">
                      <p className="font-medium mb-1">Education:</p>
                      <div className="whitespace-pre-line text-muted-foreground text-xs">
                        {template.education}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {template.field}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTemplates;
