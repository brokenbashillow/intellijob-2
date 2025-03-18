import { useSkillsData } from "@/hooks/useSkillsData";
import { useAssessmentForm } from "@/hooks/useAssessmentForm";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import LocationStep from "./LocationStep";
import TechnicalSkillsStep from "./TechnicalSkillsStep";
import SoftSkillsStep from "./SoftSkillsStep";
import FormNavigation from "./FormNavigation";
import { useEffect } from "react";

interface AssessmentFormProps {
  onProgressChange: (step: number) => void;
}

export const AssessmentForm = ({ onProgressChange }: AssessmentFormProps) => {
  const {
    currentStep,
    formData,
    setFormData,
    handleNext,
    handlePrevious,
    isSubmitting,
  } = useAssessmentForm(onProgressChange);

  // Get skills data to validate and ensure proper UUIDs
  const { skills, loading } = useSkillsData();

  // Validate and fix skills
  useEffect(() => {
    if (!loading && skills?.length > 0 && (formData.technicalSkills?.length > 0 || formData.softSkills?.length > 0)) {
      console.log("Current technical skills:", formData.technicalSkills);
      console.log("Current soft skills:", formData.softSkills);
      
      // Function to ensure skill IDs are valid UUIDs or convert them to real skill IDs
      const validateAndFixSkills = (skillNames: string[] | undefined, skillType: string) => {
        if (!skillNames?.length || !skills?.length) return [];
        
        const validSkills: string[] = [];
        
        // Check if the skill names match any skills in the database by name
        skillNames.forEach(skillName => {
          // If it's already a valid UUID, keep it
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(skillName)) {
            // Verify that the UUID actually exists in our skills list
            const skillExists = skills.some(s => s.id === skillName);
            if (skillExists) {
              validSkills.push(skillName);
              console.log(`${skillType} skill ${skillName} is a valid UUID and exists in our skills list`);
            } else {
              console.warn(`${skillType} skill ${skillName} is a valid UUID but doesn't exist in our skills list`);
            }
            return;
          }
          
          // Look for a matching skill by name
          const matchingSkill = skills.find(s => 
            s.name.toLowerCase() === skillName.toLowerCase() ||
            s.name.toLowerCase().replace(/\s+/g, '-') === skillName.toLowerCase()
          );
          
          if (matchingSkill) {
            validSkills.push(matchingSkill.id);
            console.log(`Matched ${skillType} skill '${skillName}' to ID ${matchingSkill.id}`);
          } else {
            console.warn(`Could not find matching skill for ${skillType} skill: ${skillName}`);
          }
        });
        
        return validSkills;
      };
      
      // Process technical skills
      if (formData.technicalSkills?.length) {
        const fixedTechnicalSkills = validateAndFixSkills(formData.technicalSkills, 'technical');
        
        if (fixedTechnicalSkills.length !== formData.technicalSkills.length || 
            !fixedTechnicalSkills.every((id, i) => id === formData.technicalSkills[i])) {
          console.log(`Technical skills before: ${formData.technicalSkills.length}, after validation: ${fixedTechnicalSkills.length}`);
          console.log("Fixed technical skills:", fixedTechnicalSkills);
          setFormData(prev => ({
            ...prev,
            technicalSkills: fixedTechnicalSkills
          }));
        }
      }
      
      // Process soft skills
      if (formData.softSkills?.length) {
        const fixedSoftSkills = validateAndFixSkills(formData.softSkills, 'soft');
        
        if (fixedSoftSkills.length !== formData.softSkills.length || 
            !fixedSoftSkills.every((id, i) => id === formData.softSkills[i])) {
          console.log(`Soft skills before: ${formData.softSkills.length}, after validation: ${fixedSoftSkills.length}`);
          console.log("Fixed soft skills:", fixedSoftSkills);
          setFormData(prev => ({
            ...prev,
            softSkills: fixedSoftSkills
          }));
        }
      }
    }
  }, [formData.technicalSkills, formData.softSkills, skills, setFormData, loading]);

  return (
    <div className="space-y-6">
      {currentStep === 1 && (
        <EducationStep
          education={formData.education}
          setEducation={(value) =>
            setFormData((prev) => ({ ...prev, education: value }))
          }
        />
      )}

      {currentStep === 2 && (
        <ExperienceStep
          experience={formData.experience}
          setExperience={(value) =>
            setFormData((prev) => ({ ...prev, experience: value }))
          }
        />
      )}

      {currentStep === 3 && (
        <TechnicalSkillsStep
          technicalSkills={formData.technicalSkills || []}
          setTechnicalSkills={(technicalSkills) => {
            console.log("Setting technical skills:", technicalSkills);
            setFormData((prev) => ({ ...prev, technicalSkills }));
          }}
        />
      )}

      {currentStep === 4 && (
        <SoftSkillsStep
          softSkills={formData.softSkills || []}
          setSoftSkills={(softSkills) => {
            console.log("Setting soft skills:", softSkills);
            setFormData((prev) => ({ ...prev, softSkills }));
          }}
        />
      )}

      {currentStep === 5 && (
        <LocationStep
          location={formData.location}
          setLocation={(location) =>
            setFormData((prev) => ({ ...prev, location }))
          }
        />
      )}

      <FormNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
