
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

  // Validate that skills are UUIDs
  const { skills } = useSkillsData();

  // Log skills for debugging
  useEffect(() => {
    if (formData.technicalSkills?.length || formData.softSkills?.length) {
      console.log("Current technical skills:", formData.technicalSkills);
      console.log("Current soft skills:", formData.softSkills);
      
      // Validate each skill ID is a valid UUID
      const validateSkills = (skillIds: string[]) => {
        const validSkills = skillIds.filter(id => {
          // Check if the ID exists in the skills data
          return skills.some(s => s.id === id);
        });
        return validSkills;
      };
      
      // If there are invalid skills, update the form data
      if (formData.technicalSkills?.length) {
        const validTechnicalSkills = validateSkills(formData.technicalSkills);
        if (validTechnicalSkills.length !== formData.technicalSkills.length) {
          console.warn("Found invalid technical skills, filtering...");
          setFormData(prev => ({
            ...prev,
            technicalSkills: validTechnicalSkills
          }));
        }
      }
      
      if (formData.softSkills?.length) {
        const validSoftSkills = validateSkills(formData.softSkills);
        if (validSoftSkills.length !== formData.softSkills.length) {
          console.warn("Found invalid soft skills, filtering...");
          setFormData(prev => ({
            ...prev,
            softSkills: validSoftSkills
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
