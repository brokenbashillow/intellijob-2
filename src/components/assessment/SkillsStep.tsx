import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SkillsStepProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
  skillsList: string[];
  title: string;
}

const SkillsStep = ({ skills, setSkills, skillsList, title }: SkillsStepProps) => {
  const handleSkillToggle = (skill: string) => {
    setSkills(
      skills.includes(skill)
        ? skills.filter((s) => s !== skill)
        : [...skills, skill]
    );
  };

  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      <div className="grid grid-cols-2 gap-4">
        {skillsList.map((skill) => (
          <div key={skill} className="flex items-center space-x-2">
            <Checkbox
              id={`skill-${skill}`}
              checked={skills.includes(skill)}
              onCheckedChange={() => handleSkillToggle(skill)}
            />
            <label
              htmlFor={`skill-${skill}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {skill}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsStep;