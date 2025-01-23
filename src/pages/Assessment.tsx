import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

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

    if (currentStep === 4 && formData.softSkills.length === 0) {
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
    // Here you would typically send the data to your backend
    console.log("Assessment submitted:", formData);
    toast({
      title: "Success!",
      description: "Your assessment has been submitted successfully.",
    });
    navigate("/dashboard");
  };

  const handleSkillToggle = (skill: string, type: "hard" | "soft") => {
    const key = type === "hard" ? "hardSkills" : "softSkills";
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(skill)
        ? prev[key].filter((s) => s !== skill)
        : [...prev[key], skill],
    }));
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
            <div className="space-y-4">
              <Label htmlFor="education">
                What is your highest educational attainment?
              </Label>
              <Input
                id="education"
                placeholder="Bachelor's Degree in Computer Science"
                value={formData.education}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    education: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label htmlFor="experience">
                Please describe your work experience
              </Label>
              <Textarea
                id="experience"
                placeholder="5 years as a Software Engineer at XYZ Inc."
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label>Select the hard skills that apply to you</Label>
              <div className="grid grid-cols-2 gap-4">
                {HARD_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hard-${skill}`}
                      checked={formData.hardSkills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill, "hard")}
                    />
                    <label
                      htmlFor={`hard-${skill}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Label>Select your soft skills</Label>
              <div className="grid grid-cols-2 gap-4">
                {SOFT_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`soft-${skill}`}
                      checked={formData.softSkills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill, "soft")}
                    />
                    <label
                      htmlFor={`soft-${skill}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
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