
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import LocationStep from "@/components/assessment/LocationStep";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMPANY_TYPES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

const EmployerAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
        description: "Your company profile has been created successfully.",
      });
      navigate("/employer-dashboard");
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
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label htmlFor="companyType">What type of company are you?</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, companyType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_TYPES.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label htmlFor="description">
                Please provide a brief description of your company
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us about your company's mission, values, and culture"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label htmlFor="employeeCount">
                How many employees do you have? (Optional)
              </Label>
              <Input
                id="employeeCount"
                type="number"
                placeholder="Enter number of employees"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeCount: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {currentStep === 4 && (
            <LocationStep
              location={formData.location}
              setLocation={(location) =>
                setFormData((prev) => ({ ...prev, location }))
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
      </div>
    </div>
  );
};

export default EmployerAssessment;
