
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSkillsData } from "@/hooks/useSkillsData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TechnicalSkillsStepProps {
  technicalSkills: string[];
  setTechnicalSkills: (skills: string[]) => void;
}

const TechnicalSkillsStep = ({ 
  technicalSkills, 
  setTechnicalSkills 
}: TechnicalSkillsStepProps) => {
  const { categories, skills, loading } = useSkillsData();
  
  const handleSkillToggle = (skillId: string) => {
    if (technicalSkills.includes(skillId)) {
      setTechnicalSkills(technicalSkills.filter(s => s !== skillId));
    } else {
      if (technicalSkills.length >= 5) {
        return; // Maximum limit reached
      }
      setTechnicalSkills([...technicalSkills, skillId]);
    }
  };

  // Group skills by category
  const skillsByCategory = categories.map(category => ({
    category,
    skills: skills.filter(skill => skill.category_id === category.id)
  }));

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
      ) : (
        <Accordion type="multiple" className="w-full">
          {skillsByCategory.map(({ category, skills }) => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger className="text-base font-medium">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={technicalSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                        disabled={technicalSkills.length >= 5 && !technicalSkills.includes(skill.id)}
                      />
                      <label
                        htmlFor={`skill-${skill.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
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
      )}
    </div>
  );
};

export default TechnicalSkillsStep;
