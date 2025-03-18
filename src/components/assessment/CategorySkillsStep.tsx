
import { ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skill, SkillCategory } from "@/types/skills";
import { useState } from "react";

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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
    setExpandedCategories(prev => ({
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
      <Label>{title}</Label>
      
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithSkills.map((category) => (
          <div key={category.id} className="col-span-1 border rounded-md">
            <div 
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => toggleCategory(category.id)}
            >
              <h3 className="font-medium">{category.name}</h3>
              {expandedCategories[category.id] ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {expandedCategories[category.id] && (
              <div className="p-3 pt-0 border-t">
                <div className="grid grid-cols-1 gap-2">
                  {getSkillsForCategory(category.id).map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                        disabled={
                          selectedSkills.length >= 5 &&
                          !selectedSkills.includes(skill.id)
                        }
                      />
                      <label
                        htmlFor={`skill-${skill.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {skill.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySkillsStep;
