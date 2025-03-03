
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FormData } from "@/types/assessment";
import { validateAssessmentStep } from "@/utils/assessmentValidation";
import { saveAssessmentData } from "@/services/assessmentService";
import { supabase } from "@/integrations/supabase/client";

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
      
      // First save the assessment data
      const assessmentId = await saveAssessmentData(formData);
      
      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      // Save technical skills
      if (formData.technicalSkills && formData.technicalSkills.length > 0 && assessmentId) {
        const technicalSkillsData = formData.technicalSkills.map(skillId => ({
          user_id: user.id,
          skill_id: skillId,
          skill_type: 'technical',
          assessment_id: assessmentId
        }));
        
        const { error: techSkillsError } = await supabase
          .from('user_skills')
          .insert(technicalSkillsData);
          
        if (techSkillsError) throw techSkillsError;
      }
      
      // Save soft skills
      if (formData.softSkills && formData.softSkills.length > 0 && assessmentId) {
        const softSkillsData = formData.softSkills.map(skillId => ({
          user_id: user.id,
          skill_id: skillId,
          skill_type: 'soft',
          assessment_id: assessmentId
        }));
        
        const { error: softSkillsError } = await supabase
          .from('user_skills')
          .insert(softSkillsData);
          
        if (softSkillsError) throw softSkillsError;
      }
      
      // Save location data to the profile
      if (formData.location) {
        const { error: locationError } = await supabase
          .from('profiles')
          .update({
            country: formData.location.country,
            province: formData.location.province,
            city: formData.location.city
          })
          .eq('id', user.id);
          
        if (locationError) throw locationError;
      }
      
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
    if (!validateAssessmentStep(currentStep, formData, toast.bind(null))) return;

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
