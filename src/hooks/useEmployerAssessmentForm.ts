
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  country: string;
  province: string;
  city: string;
}

interface FormData {
  companyType: string;
  description: string;
  employeeCount: string;
  location: LocationData;
}

export const useEmployerAssessmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyType: "",
    description: "",
    employeeCount: "",
    location: {
      country: "",
      province: "",
      city: "",
    },
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 1 && !formData.companyType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select your company type",
      });
      return;
    }

    if (currentStep === 2 && !formData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a company description",
      });
      return;
    }

    if (currentStep === 4) {
      if (!formData.location.country || !formData.location.city) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your country and city",
        });
        return;
      }
      handleSubmit();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to complete the assessment",
        });
        navigate('/');
        return;
      }
      
      // Save location to profiles table
      const { error: locationError } = await supabase
        .from('profiles')
        .update({
          country: formData.location.country,
          province: formData.location.province,
          city: formData.location.city,
        })
        .eq('id', user.id);

      if (locationError) throw locationError;

      // Save company type, description, and employee count to employer_assessments table
      const { error: assessmentError } = await supabase
        .from('employer_assessments')
        .upsert({
          user_id: user.id,
          company_type: formData.companyType,
          description: formData.description,
          employee_count: formData.employeeCount ? parseInt(formData.employeeCount) : null,
        });

      if (assessmentError) throw assessmentError;

      console.log("Assessment submitted:", formData);
      toast({
        title: "Success!",
        description: "Your company profile has been created successfully.",
      });
      navigate("/employer-dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save assessment information.",
      });
    }
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    progress,
    totalSteps,
    handleNext,
  };
};
