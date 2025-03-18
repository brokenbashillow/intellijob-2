import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExperienceStepProps {
  experience: string;
  setExperience: (value: string) => void;
}

const ExperienceStep = ({ experience, setExperience }: ExperienceStepProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="experience">
        Please describe your work experience
      </Label>
      <Textarea
        id="experience"
        placeholder="5 years as a Software Engineer at XYZ Inc."
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />
    </div>
  );
};

export default ExperienceStep;