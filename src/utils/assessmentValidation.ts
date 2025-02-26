
import { FormData } from "@/types/assessment";
import { UseToastReturn } from "@/components/ui/use-toast";

export const validateAssessmentStep = (
  currentStep: number,
  formData: FormData,
  toast: UseToastReturn["toast"]
): boolean => {
  if (currentStep === 1 && !formData.education) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please enter your highest educational attainment",
    });
    return false;
  }

  if (currentStep === 2 && !formData.experience) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please describe your work experience",
    });
    return false;
  }

  if (currentStep === 3 && formData.technicalSkills.length < 3) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select at least 3 technical skills",
    });
    return false;
  }

  if (currentStep === 4 && formData.softSkills.length < 3) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select at least 3 soft skills",
    });
    return false;
  }

  if (currentStep === 5) {
    if (!formData.location.country || !formData.location.city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your country and city",
      });
      return false;
    }
    return true;
  }

  return true;
};
