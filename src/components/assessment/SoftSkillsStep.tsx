
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSkillsData } from "@/hooks/useSkillsData";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface SoftSkillsStepProps {
  softSkills: string[];
  setSoftSkills: (skills: string[]) => void;
}

const SoftSkillsStep = ({ 
  softSkills, 
  setSoftSkills 
}: SoftSkillsStepProps) => {
  const { categories, skills, loading } = useSkillsData();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  
  // Handle skill selection/deselection
  const handleSkillToggle = (skillId: string) => {
    if (softSkills.includes(skillId)) {
      // Remove the skill
      setSoftSkills(softSkills.filter(id => id !== skillId));
    } else {
      // Add the skill if under limit
      if (softSkills.length >= 5) {
        return;
      }
      setSoftSkills([...softSkills, skillId]);
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Open first soft skill category automatically for better UX
  useEffect(() => {
    if (!loading && categories.length > 0) {
      const softCategories = categories.filter(cat => cat.type === 'soft');
      if (softCategories.length > 0) {
        setOpenCategories(prev => ({
          ...prev,
          [softCategories[0].id]: true
        }));
      }
    }
  }, [loading, categories]);

  // Group skills by category - filter for soft skills only
  const categoriesWithSkills = categories
    .filter(category => category.type === 'soft')
    .filter(category => skills.some(skill => skill.category_id === category.id));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Soft Skills</h2>
      <p className="text-muted-foreground">
        Select 3-5 soft skills that you possess
      </p>
      
      {softSkills.length < 3 ? (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least {3 - softSkills.length} more soft skills
          </AlertDescription>
        </Alert>
      ) : softSkills.length >= 5 ? (
        <Alert>
          <AlertDescription>
            Maximum of 5 soft skills selected
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {softSkills.length} skills selected
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading skills...</div>
      ) : categoriesWithSkills.length === 0 ? (
        <div className="text-center py-4">
          <Alert>
            <AlertDescription>
              No soft skill categories found.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          {categoriesWithSkills.map((category) => (
            <Collapsible
              key={category.id}
              open={openCategories[category.id]}
              onOpenChange={() => toggleCategory(category.id)}
              className="border rounded-md overflow-hidden"
            >
              <CollapsibleTrigger className="flex justify-between items-center w-full p-4 text-left hover:bg-slate-50">
                <h3 className="font-medium">{category.name}</h3>
                {openCategories[category.id] ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4 pt-1 border-t">
                <div className="grid grid-cols-1 gap-3">
                  {skills
                    .filter(skill => skill.category_id === category.id)
                    .map((skill) => (
                      <div key={skill.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`soft-skill-${skill.id}`}
                          checked={softSkills.includes(skill.id)}
                          onCheckedChange={() => handleSkillToggle(skill.id)}
                          disabled={softSkills.length >= 5 && !softSkills.includes(skill.id)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={`soft-skill-${skill.id}`}
                          className="text-sm cursor-pointer leading-tight"
                        >
                          {skill.name}
                        </label>
                      </div>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default SoftSkillsStep;
