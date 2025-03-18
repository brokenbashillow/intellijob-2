
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
