
import { useState, useEffect } from "react";
import { useSkillsData } from "@/hooks/useSkillsData";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import type { Skill as SkillType } from "@/types/skills";

interface TechnicalSkillsStepProps {
  technicalSkills: string[];
  setTechnicalSkills: (skills: string[]) => void;
}

const TechnicalSkillsStep = ({ 
  technicalSkills, 
  setTechnicalSkills 
}: TechnicalSkillsStepProps) => {
  const { categories, skills, loading } = useSkillsData();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    console.log("TechnicalSkillsStep rendered with skills:", technicalSkills);
    console.log("Available categories:", categories);
    console.log("Available skills:", skills);
  }, [technicalSkills, categories, skills]);
  
  const handleSkillToggle = (skillId: string) => {
    console.log("Toggle called for skill ID:", skillId);
    
    if (!skillId) {
      console.error("Invalid skill ID provided");
      return;
    }
    
    if (technicalSkills.includes(skillId)) {
      // Remove the skill - create a new array to ensure React detects the change
      setTechnicalSkills(technicalSkills.filter(id => id !== skillId));
    } else {
      // Add the skill if under limit - create a new array to ensure React detects the change
      if (technicalSkills.length >= 5) {
        console.log("Max skills limit reached (5)");
        return;
      }
      setTechnicalSkills([...technicalSkills, skillId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getSkillsForCategory = (categoryId: string) => {
    // Only filter by category ID, no type filtering needed since we only display technical categories
    return skills.filter(skill => skill.category_id === categoryId);
  };
  
  // Open first technical category automatically for better UX
  useEffect(() => {
    if (!loading && categories.length > 0) {
      const techCategories = categories.filter(cat => cat.type === 'technical');
      if (techCategories.length > 0) {
        setOpenCategories(prev => ({
          ...prev,
          [techCategories[0].id]: true
        }));
      }
    }
  }, [loading, categories]);

  // Filter out categories that have no skills
  const categoriesWithSkills = categories
    .filter((category) => category.type === 'technical')
    .filter((category) => getSkillsForCategory(category.id).length > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Technical Skills</h2>
      <p className="text-muted-foreground">
        Select 3-5 technical skills that you possess
      </p>
      
      {technicalSkills.length < 3 ? (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least {3 - technicalSkills.length} more technical skills
          </AlertDescription>
        </Alert>
      ) : technicalSkills.length >= 5 ? (
        <Alert>
          <AlertDescription>
            Maximum of 5 technical skills selected
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {technicalSkills.length} skills selected
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading skills...</div>
      ) : categories.length === 0 || skills.length === 0 ? (
        <div className="text-center py-4">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load skills. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </div>
      ) : categoriesWithSkills.length === 0 ? (
        <div className="text-center py-4">
          <Alert>
            <AlertDescription>
              No technical skill categories found. Please check your database setup.
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
                  {getSkillsForCategory(category.id).map((skill) => (
                    <div key={skill.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`tech-skill-${skill.id}`}
                        checked={technicalSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                        disabled={
                          technicalSkills.length >= 5 &&
                          !technicalSkills.includes(skill.id)
                        }
                        className="mt-1"
                      />
                      <label
                        htmlFor={`tech-skill-${skill.id}`}
                        className="text-sm cursor-pointer"
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

export default TechnicalSkillsStep;
