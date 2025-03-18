
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExperienceStepProps {
  experience: string;
  setExperience: (value: string) => void;
}

const ExperienceStep = ({ experience, setExperience }: ExperienceStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="experience" className="text-lg font-medium">
          Please describe your work experience
        </Label>
      </div>
      <Textarea
        id="experience"
        placeholder="e.g., 5 years as a Software Engineer at XYZ Inc."
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        className="min-h-32"
      />
    </div>
  );
};

export default ExperienceStep;
