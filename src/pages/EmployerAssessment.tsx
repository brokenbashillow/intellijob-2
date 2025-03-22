
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import LocationStep from "@/components/assessment/LocationStep";
import { useEmployerAssessmentForm } from "@/hooks/useEmployerAssessmentForm";
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
  const {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    progress,
    totalSteps,
    handleNext,
  } = useEmployerAssessmentForm();

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
                value={formData.companyType}
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

              {formData.companyType === "other" && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="customCompanyType">Specify your company type</Label>
                  <Input
                    id="customCompanyType"
                    placeholder="Enter your company type"
                    value={formData.customCompanyType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customCompanyType: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
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
