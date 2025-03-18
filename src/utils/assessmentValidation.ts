
import { FormData } from "@/types/assessment";

type ToastFunction = (title: string, description: string) => boolean;

export const validateAssessmentStep = (
  currentStep: number,
  formData: FormData,
  toast: ToastFunction
): boolean => {
  if (currentStep === 1 && !formData.education) {
    toast(
      "Error",
      "Please enter your highest educational attainment"
    );
    return false;
  }

  if (currentStep === 2 && !formData.experience) {
    toast(
      "Error",
      "Please describe your work experience"
    );
    return false;
  }

  if (currentStep === 3 && formData.technicalSkills.length < 3) {
    toast(
      "Error",
      "Please select at least 3 technical skills"
    );
    return false;
  }

  if (currentStep === 4 && formData.softSkills.length < 3) {
    toast(
      "Error",
      "Please select at least 3 soft skills"
    );
    return false;
  }

  if (currentStep === 5) {
    if (!formData.location.country || !formData.location.city) {
      toast(
        "Error",
        "Please enter your country and city"
      );
      return false;
    }
    return true;
  }

  return true;
};
