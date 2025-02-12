
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  education: string;
  experience: string;
  technicalSkills: string[];
  softSkills: string[];
  location: {
    country: string;
    province: string;
    city: string;
  };
  jobTitle: string;
}

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
    jobTitle: "",
  });

  const handleSubmit = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("No authenticated user found");
      }

      // Save the assessment data
      const { error: assessmentError } = await supabase
        .from('seeker_assessments')
        .insert({
          user_id: user.data.user.id,
          education: formData.education,
          experience: formData.experience,
          job_title: formData.jobTitle
        });

      if (assessmentError) throw assessmentError;

      // Save technical skills
      const technicalSkillsData = formData.technicalSkills.map(skillId => ({
        user_id: user.data.user!.id,
        skill_id: skillId,
        skill_type: 'technical'
      }));

      const { error: technicalSkillsError } = await supabase
        .from('user_skills')
        .insert(technicalSkillsData);

      if (technicalSkillsError) throw technicalSkillsError;

      // Save soft skills
      const softSkillsData = formData.softSkills.map(skillId => ({
        user_id: user.data.user!.id,
        skill_id: skillId,
        skill_type: 'soft'
      }));

      const { error: softSkillsError } = await supabase
        .from('user_skills')
        .insert(softSkillsData);

      if (softSkillsError) throw softSkillsError;

      // Update location in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          country: formData.location.country,
          province: formData.location.province,
          city: formData.location.city,
        })
        .eq('id', user.data.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "Your assessment has been submitted successfully.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save assessment data.",
      });
    }
  };

  const validateStep = () => {
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
    }

    if (currentStep === 6) {
      if (!formData.jobTitle) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your desired job title",
        });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep === 6) {
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
  };
};
