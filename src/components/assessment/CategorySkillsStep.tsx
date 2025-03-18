
import { useState } from "react";
import { Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skill, SkillCategory } from "@/types/skills";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorySkillsStepProps {
  title: string;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  categories: SkillCategory[];
  skills: Skill[];
  type: 'technical' | 'soft';
  isLoading?: boolean;
}

const CategorySkillsStep = ({
  title,
  selectedSkills,
  setSelectedSkills,
  categories,
  skills,
  type,
  isLoading = false,
}: CategorySkillsStepProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
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

  const getSkillsForCategory = (categoryId: string) => {
    return skills.filter((skill) => skill.category_id === categoryId);
  };

  // Filter out categories that have no skills or that don't match the current type
  const categoriesWithSkills = categories
    .filter((category) => category.type === type)
    .filter((category) => getSkillsForCategory(category.id).length > 0);
  
  // For debugging
  console.log(`${type} categories:`, categoriesWithSkills);
  console.log(`Selected ${type} skills:`, selectedSkills);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label>{title}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      
      {selectedSkills.length < 3 ? (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least {3 - selectedSkills.length} more {type} skills (minimum 3 required)
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
            {selectedSkills.length} skills selected (you can add {5 - selectedSkills.length} more)
          </AlertDescription>
        </Alert>
      )}
      
      {categoriesWithSkills.length === 0 ? (
        <Alert>
          <AlertDescription>
            No {type} skill categories found. Please contact support.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithSkills.map((category) => {
            const categorySkills = getSkillsForCategory(category.id);
            const selectedCount = categorySkills.filter(skill => 
              selectedSkills.includes(skill.id)).length;
              
            return (
              <div key={category.id} className="col-span-1 border rounded-lg shadow-sm">
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full"
                  value={expandedCategory === category.id ? category.id : undefined}
                  onValueChange={(value) => setExpandedCategory(value || null)}
                >
                  <AccordionItem value={category.id} className="border-0">
                    <AccordionTrigger className="text-left px-4 py-3 hover:no-underline">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{category.name}</span>
                        {selectedCount > 0 && (
                          <span className="text-xs text-green-600 mt-1">
                            {selectedCount} selected
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="grid grid-cols-1 gap-2">
                        {categorySkills.map((skill) => (
                          <div key={skill.id} className="flex items-center space-x-2 p-1 rounded hover:bg-slate-50">
                            <Checkbox
                              id={`skill-${skill.id}`}
                              checked={selectedSkills.includes(skill.id)}
                              onCheckedChange={() => handleSkillToggle(skill.id)}
                              disabled={
                                selectedSkills.length >= 5 &&
                                !selectedSkills.includes(skill.id)
                              }
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <label
                              htmlFor={`skill-${skill.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                            >
                              {skill.name}
                            </label>
                            {selectedSkills.includes(skill.id) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySkillsStep;
