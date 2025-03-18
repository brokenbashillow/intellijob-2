
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FormData } from "@/types/assessment";
import { validateAssessmentStep } from "@/utils/assessmentValidation";
import { saveAssessmentData } from "@/services/assessmentService";

export const useAssessmentForm = (onProgressChange: (step: number) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    education: "",
    experience: "",
    technicalSkills: [],
    softSkills: [],
    location: {
      country: "",
      province: "",
      city: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting assessment form data:", formData);
      
      // Basic validation before submission
      if (formData.technicalSkills.length < 3) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least 3 technical skills."
        });
        return;
      }
      
      if (formData.softSkills.length < 3) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least 3 soft skills."
        });
        return;
      }
      
      // Save the assessment data, including all skills and location
      const assessmentId = await saveAssessmentData(formData);
      console.log("Assessment saved with ID:", assessmentId);
      
      toast({
        title: "Success!",
        description: "Your assessment has been submitted successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save assessment data.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Fix the type mismatch by using a proper toast function wrapper
    const showToast = (title: string, description: string) => {
      toast({
        variant: "destructive",
        title,
        description,
      });
      return false;
    };
    
    const stepValidation = validateAssessmentStep(currentStep, formData, showToast);
    
    if (!stepValidation) return;

    if (currentStep === 5) {
      handleSubmit();
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    onProgressChange(nextStep);
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    onProgressChange(prevStep);
  };

  return {
    currentStep,
    formData,
    setFormData,
    handleNext,
    handlePrevious,
    isSubmitting,
  };
};
