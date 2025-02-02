import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import EducationStep from "@/components/assessment/EducationStep";
import ExperienceStep from "@/components/assessment/ExperienceStep";
import SkillsStep from "@/components/assessment/SkillsStep";

const HARD_SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "SQL",
  "AutoCAD",
  "MATLAB",
  "Excel",
  "PowerBI",
  "SEO",
  "Content Creation",
];

const SOFT_SKILLS = [
  "Communication",
  "Problem-solving",
  "Teamwork",
  "Adaptability",
  "Leadership",
  "Time Management",
  "Attention to Detail",
];

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    education: "",
    experience: "",
    hardSkills: [] as string[],
    softSkills: [] as string[],
  });

  const totalSteps = 4;
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

    if (currentStep === 3 && formData.hardSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one hard skill",
      });
      return;
    }

    if (currentStep === totalSteps && formData.softSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one soft skill",
      });
      return;
    }

    if (currentStep === totalSteps) {
      handleSubmit();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = () => {
    console.log("Assessment submitted:", formData);
    toast({
      title: "Success!",
      description: "Your assessment has been submitted successfully.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
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
            <SkillsStep
              skills={formData.hardSkills}
              setSkills={(skills) =>
                setFormData((prev) => ({ ...prev, hardSkills: skills }))
              }
              skillsList={HARD_SKILLS}
              title="Select the hard skills that apply to you"
            />
          )}

          {currentStep === 4 && (
            <SkillsStep
              skills={formData.softSkills}
              setSkills={(skills) =>
                setFormData((prev) => ({ ...prev, softSkills: skills }))
              }
              skillsList={SOFT_SKILLS}
              title="Select your soft skills"
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
      </div>
    </div>
  );
};

export default Assessment;