
import { useSkillsData } from "@/hooks/useSkillsData";
import { useAssessmentForm } from "@/hooks/useAssessmentForm";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import CategorySkillsStep from "./CategorySkillsStep";
import LocationStep from "./LocationStep";
import FormNavigation from "./FormNavigation";
import { Skeleton } from "@/components/ui/skeleton";

interface AssessmentFormProps {
  onProgressChange: (step: number) => void;
}

export const AssessmentForm = ({ onProgressChange }: AssessmentFormProps) => {
  const { categories, skills, isLoading } = useSkillsData();
  const {
    currentStep,
    formData,
    setFormData,
    handleNext,
    handlePrevious,
    isSubmitting
  } = useAssessmentForm(onProgressChange);

  if (isLoading && (currentStep === 3 || currentStep === 4)) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex justify-between mt-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

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
          isLoading={isLoading}
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
          isLoading={isLoading}
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
