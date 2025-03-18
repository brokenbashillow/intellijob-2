
import { useSkillsData } from "@/hooks/useSkillsData";
import { useAssessmentForm } from "@/hooks/useAssessmentForm";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import LocationStep from "./LocationStep";
import TechnicalSkillsStep from "./TechnicalSkillsStep";
import SoftSkillsStep from "./SoftSkillsStep";
import FormNavigation from "./FormNavigation";

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
            console.log("Setting technical skills in form:", technicalSkills);
            setFormData((prev) => ({ ...prev, technicalSkills }));
          }}
        />
      )}

      {currentStep === 4 && (
        <SoftSkillsStep
          softSkills={formData.softSkills || []}
          setSoftSkills={(softSkills) => {
            console.log("Setting soft skills in form:", softSkills);
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
