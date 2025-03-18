
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
    if (!loading && skills?.length > 0) {
      // Only run validation if we have skills from the database and have selected skills
      const hasTechnicalSkills = formData.technicalSkills && formData.technicalSkills.length > 0;
      const hasSoftSkills = formData.softSkills && formData.softSkills.length > 0;
      
      if (hasTechnicalSkills || hasSoftSkills) {
        console.log("Current technical skills:", formData.technicalSkills);
        console.log("Current soft skills:", formData.softSkills);
        
        // Function to ensure skill IDs match existing skills in the database
        const validateAndFixSkills = (skillIds: string[] | undefined, skillType: string) => {
          if (!skillIds?.length) return [];
          
          const validSkills: string[] = [];
          
          skillIds.forEach(skillId => {
            // Check if the skill ID exists in our skills list
            const skillExists = skills.some(skill => skill.id === skillId);
            
            if (skillExists) {
              validSkills.push(skillId);
              console.log(`${skillType} skill ${skillId} exists in our skills list`);
            } else {
              console.warn(`Could not find matching skill for ${skillType} skill: ${skillId}`);
              
              // Try to find a skill with matching name (for fallback)
              const matchingSkill = skills.find(skill => 
                skill.name.toLowerCase() === skillId.toLowerCase()
              );
              
              if (matchingSkill) {
                validSkills.push(matchingSkill.id);
                console.log(`Matched ${skillType} skill name '${skillId}' to ID ${matchingSkill.id}`);
              }
            }
          });
          
          return validSkills;
        };
        
        // Process technical skills if they exist
        if (hasTechnicalSkills) {
          const fixedTechnicalSkills = validateAndFixSkills(formData.technicalSkills, 'technical');
          
          if (fixedTechnicalSkills.length !== formData.technicalSkills.length) {
            console.log(`Technical skills before: ${formData.technicalSkills.length}, after validation: ${fixedTechnicalSkills.length}`);
            console.log("Fixed technical skills:", fixedTechnicalSkills);
            
            // Only update if there's a difference to avoid infinite re-renders
            setFormData(prev => ({
              ...prev,
              technicalSkills: fixedTechnicalSkills
            }));
          }
        }
        
        // Process soft skills if they exist
        if (hasSoftSkills) {
          const fixedSoftSkills = validateAndFixSkills(formData.softSkills, 'soft');
          
          if (fixedSoftSkills.length !== formData.softSkills.length) {
            console.log(`Soft skills before: ${formData.softSkills.length}, after validation: ${fixedSoftSkills.length}`);
            console.log("Fixed soft skills:", fixedSoftSkills);
            
            // Only update if there's a difference to avoid infinite re-renders
            setFormData(prev => ({
              ...prev,
              softSkills: fixedSoftSkills
            }));
          }
        }
      }
    }
  }, [loading, skills]); // Removed formData.technicalSkills and formData.softSkills from dependencies to prevent infinite loops

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
