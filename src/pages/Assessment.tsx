
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EducationStep from "@/components/assessment/EducationStep";
import ExperienceStep from "@/components/assessment/ExperienceStep";
import CategorySkillsStep from "@/components/assessment/CategorySkillsStep";
import LocationStep from "@/components/assessment/LocationStep";
// import JobTitleStep from "@/components/assessment/JobTitleStep";
import type { SkillCategory, Skill } from "@/types/skills";

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState({
    education: "",
    experience: "",
    technicalSkills: [] as string[],
    softSkills: [] as string[],
    location: {
      country: "",
      province: "",
      city: "",
    },
    // jobTitle: "",
  });

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        if (skillsError) throw skillsError;

        setCategories(categoriesData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data. Please try again.",
        });
      }
    };

    fetchSkillsData();
  }, [toast]);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

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
      handleSubmit();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          country: formData.location.country,
          province: formData.location.province,
          city: formData.location.city,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      console.log("Assessment submitted:", formData);
      toast({
        title: "Success!",
        description: "Your assessment has been submitted successfully.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save location information.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Skills Assessment</h1>
          <Progress value={progress} className="h-2" />
        </div>

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

          {/* {currentStep === 6 && (
            <JobTitleStep
              JobTitle={formData.jobTitle}
              setJobTitle={(value) =>
                setFormData((prev) => ({ ...prev, education: value }))
              }
            />
          )} */}

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
      </div>
    </div>
  );
};

export default Assessment;
