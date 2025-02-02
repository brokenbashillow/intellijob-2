import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EducationStepProps {
  education: string;
  setEducation: (value: string) => void;
}

const EducationStep = ({ education, setEducation }: EducationStepProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="education">
        What is your highest educational attainment?
      </Label>
      <Input
        id="education"
        placeholder="Bachelor's Degree in Computer Science"
        value={education}
        onChange={(e) => setEducation(e.target.value)}
      />
    </div>
  );
};

export default EducationStep;