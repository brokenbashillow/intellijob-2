
import { useState } from "react";
import { Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skill, SkillCategory } from "@/types/skills";

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

  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      
      {selectedSkills.length < 3 && (
        <Alert>
          <AlertDescription>
            Please select at least {3 - selectedSkills.length} more {type} skills
          </AlertDescription>
        </Alert>
      )}
      
      {selectedSkills.length >= 5 && (
        <Alert>
          <AlertDescription>
            Maximum of 5 {type} skills reached
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="multiple" className="w-full">
        {categories
          .filter((category) => category.type === type)
          .map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-left">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {getSkillsForCategory(category.id).map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                        disabled={selectedSkills.length >= 5 && !selectedSkills.includes(skill.id)}
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
          ))}
      </Accordion>
    </div>
  );
};

export default CategorySkillsStep;
