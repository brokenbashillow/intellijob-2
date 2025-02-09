
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import CategorySkillsStep from "./CategorySkillsStep";
import LocationStep from "./LocationStep";
import JobTitleStep from "./JobTitleStep";
import { useSkillsData } from "@/hooks/useSkillsData";

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

export const AssessmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const { categories, skills } = useSkillsData();
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

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleNext = () => {
    if (currentStep === 1 && !formData.education) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your highest educational attainment",
      });
      return;
    }

    if (currentStep === 2 && !formData.experience) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please describe your work experience",
      });
      return;
    }

    if (currentStep === 3 && formData.technicalSkills.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least 3 technical skills",
      });
      return;
    }

    if (currentStep === 4 && formData.softSkills.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least 3 soft skills",
      });
      return;
    }

    if (currentStep === 5) {
      if (!formData.location.country || !formData.location.city) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your country and city",
        });
        return;
      }
    }

    if (currentStep === 6) {
      if (!formData.jobTitle) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your desired job title",
        });
        return;
      }
      handleSubmit();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

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

      {currentStep === 6 && (
        <JobTitleStep
          JobTitle={formData.jobTitle}
          setJobTitle={(value) =>
            setFormData((prev) => ({ ...prev, jobTitle: value }))
          }
        />
      )}

      <div className="flex justify-end space-x-4">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            Previous
          </Button>
        )}
        <Button onClick={handleNext}>
          {currentStep === totalSteps ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};
