
import { ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skill, SkillCategory } from "@/types/skills";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface CategorySkillsStepProps {
  title: string;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  categories: SkillCategory[];
  skills: Skill[];
  type: 'technical' | 'soft';
}

const CategorySkillsStep = ({
  title,
  selectedSkills,
  setSelectedSkills,
  categories,
  skills,
  type,
}: CategorySkillsStepProps) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const handleSkillToggle = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      if (selectedSkills.length >= 5) {
        return; // Maximum limit reached
      }
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getSkillsForCategory = (categoryId: string) => {
    return skills.filter((skill) => skill.category_id === categoryId);
  };

  // Filter out categories that have no skills
  const categoriesWithSkills = categories
    .filter((category) => category.type === type)
    .filter((category) => getSkillsForCategory(category.id).length > 0);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">{title}</Label>
      
      {selectedSkills.length < 3 ? (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least {3 - selectedSkills.length} more {type} skills
          </AlertDescription>
        </Alert>
      ) : selectedSkills.length >= 5 ? (
        <Alert>
          <AlertDescription>
            Maximum of 5 {type} skills selected
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {selectedSkills.length} skills selected
          </AlertDescription>
        </Alert>
      )}
      
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
                      id={`skill-${skill.id}`}
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={() => handleSkillToggle(skill.id)}
                      disabled={
                        selectedSkills.length >= 5 &&
                        !selectedSkills.includes(skill.id)
                      }
                      className="mt-1"
                    />
                    <label
                      htmlFor={`skill-${skill.id}`}
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
    </div>
  );
};

export default CategorySkillsStep;
