
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  country: string;
  province: string;
  city: string;
}

export type EmployeeCountRange = 
  | "1-10" 
  | "11-50" 
  | "51-100" 
  | "101-250" 
  | "251-500" 
  | "501-1000" 
  | "1001-5000" 
  | "5001-10000" 
  | "10001+";

interface FormData {
  companyType: string;
  customCompanyType: string;
  description: string;
  employeeCount: EmployeeCountRange;
  location: LocationData;
}

export const useEmployerAssessmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyType: "",
    customCompanyType: "",
    description: "",
    employeeCount: "" as EmployeeCountRange,
    location: {
      country: "",
      province: "",
      city: "",
    },
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.companyType) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select your company type",
        });
        return;
      }

      if (formData.companyType === "other" && !formData.customCompanyType) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please specify your company type",
        });
        return;
      }
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

      // Determine final company type value
      const finalCompanyType = 
        formData.companyType === "other" ? formData.customCompanyType : formData.companyType;

      // Save company type, description, and employee count to employer_assessments table
      const { error: assessmentError } = await supabase
        .from('employer_assessments')
        .upsert({
          user_id: user.id,
          company_type: finalCompanyType,
          description: formData.description,
          employee_count: formData.employeeCount,
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
