
import { useSkillsData } from "@/hooks/useSkillsData";
import { useAssessmentForm } from "@/hooks/useAssessmentForm";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import CategorySkillsStep from "./CategorySkillsStep";
import LocationStep from "./LocationStep";
import JobTitleStep from "./JobTitleStep";
import FormNavigation from "./FormNavigation";

interface AssessmentFormProps {
  onProgressChange: (step: number) => void;
}

export const AssessmentForm = ({ onProgressChange }: AssessmentFormProps) => {
  const { categories, skills } = useSkillsData();
  const {
    currentStep,
    formData,
    setFormData,
    handleNext,
    handlePrevious,
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
        <CategorySkillsStep
          title="Select your technical skills (min 3, max 5)"
          selectedSkills={formData.technicalSkills}
          setSelectedSkills={(skills) =>
            setFormData((prev) => ({ ...prev, technicalSkills: skills }))
          }
          categories={categories}
          skills={skills}
          type="technical"
        />
      )}

      {currentStep === 4 && (
        <CategorySkillsStep
          title="Select your soft skills (min 3, max 5)"
          selectedSkills={formData.softSkills}
          setSelectedSkills={(skills) =>
            setFormData((prev) => ({ ...prev, softSkills: skills }))
          }
          categories={categories}
          skills={skills}
          type="soft"
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

      {currentStep === 6 && (
        <JobTitleStep
          JobTitle={formData.jobTitle}
          setJobTitle={(value) =>
            setFormData((prev) => ({ ...prev, jobTitle: value }))
          }
        />
      )}

      <FormNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};
