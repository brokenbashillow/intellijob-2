
import { FormData } from "@/types/assessment";
import { toast as ToastFunction } from "@/hooks/use-toast";

export const validateAssessmentStep = (
  currentStep: number,
  formData: FormData,
  toast: typeof ToastFunction
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

  if (currentStep === 3) {
    if (!formData.technicalSkills || formData.technicalSkills.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least 3 technical skills",
      });
      return false;
    }
    if (formData.technicalSkills.length > 5) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at most 5 technical skills",
      });
      return false;
    }
    return true;
  }

  if (currentStep === 4) {
    if (!formData.softSkills || formData.softSkills.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least 3 soft skills",
      });
      return false;
    }
    if (formData.softSkills.length > 5) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at most 5 soft skills",
      });
      return false;
    }
    return true;
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
