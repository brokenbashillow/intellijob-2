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
  const { skills } = useSkillsData();

  // Validate and fix skills
  useEffect(() => {
    if (formData.technicalSkills?.length || formData.softSkills?.length) {
      console.log("Current technical skills:", formData.technicalSkills);
      console.log("Current soft skills:", formData.softSkills);
      
      // Function to ensure skill IDs are valid UUIDs or convert them to real skill IDs
      const validateAndFixSkills = (skillNames: string[]) => {
        if (!skillNames?.length || !skills?.length) return [];
        
        const validSkills = [];
        
        // Check if the skill names match any skills in the database by name
        for (const skillName of skillNames) {
          // If it's already a valid UUID, keep it
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(skillName)) {
            validSkills.push(skillName);
            continue;
          }
          
          // Look for a matching skill by name or ID
          const matchingSkill = skills.find(s => 
            s.id === skillName || 
            s.name.toLowerCase() === skillName.toLowerCase() ||
            s.name.toLowerCase().replace(/\s+/g, '-') === skillName.toLowerCase()
          );
          
          if (matchingSkill) {
            validSkills.push(matchingSkill.id);
          } else {
            console.warn(`Could not find matching skill for: ${skillName}`);
          }
        }
        
        return validSkills;
      };
      
      // Process technical skills
      if (formData.technicalSkills?.length) {
        const fixedTechnicalSkills = validateAndFixSkills(formData.technicalSkills);
        if (fixedTechnicalSkills.length !== formData.technicalSkills.length) {
          console.log("Fixed technical skills:", fixedTechnicalSkills);
          setFormData(prev => ({
            ...prev,
            technicalSkills: fixedTechnicalSkills
          }));
        }
      }
      
      // Process soft skills
      if (formData.softSkills?.length) {
        const fixedSoftSkills = validateAndFixSkills(formData.softSkills);
        if (fixedSoftSkills.length !== formData.softSkills.length) {
          console.log("Fixed soft skills:", fixedSoftSkills);
          setFormData(prev => ({
            ...prev,
            softSkills: fixedSoftSkills
          }));
        }
      }
    }
  }, [formData.technicalSkills, formData.softSkills, skills, setFormData]);

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
          setTechnicalSkills={(technicalSkills) =>
            setFormData((prev) => ({ ...prev, technicalSkills }))
          }
        />
      )}

      {currentStep === 4 && (
        <SoftSkillsStep
          softSkills={formData.softSkills || []}
          setSoftSkills={(softSkills) =>
            setFormData((prev) => ({ ...prev, softSkills }))
          }
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
