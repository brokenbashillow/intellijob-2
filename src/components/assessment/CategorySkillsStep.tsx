
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

  // Filter out categories that have no skills
  const categoriesWithSkills = categories
    .filter((category) => category.type === type)
    .filter((category) => getSkillsForCategory(category.id).length > 0);

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
      
      {categoriesWithSkills.length === 0 ? (
        <Alert>
          <AlertDescription>
            No {type} skill categories found. Please contact support.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithSkills.map((category) => (
            <div key={category.id} className="col-span-1">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={category.id}>
                  <AccordionTrigger className="text-left">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySkillsStep;
