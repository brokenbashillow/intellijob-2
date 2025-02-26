
import { SkillItem } from "@/hooks/useResumeData";
import { Badge } from "@/components/ui/badge";

interface SkillsSectionProps {
  skills: SkillItem[];
  setSkills: (skills: SkillItem[]) => void;
}

export function SkillsSection({ skills, setSkills }: SkillsSectionProps) {
  const technicalSkills = skills.filter(skill => skill.type === 'technical');
  const softSkills = skills.filter(skill => skill.type === 'soft');

  const removeSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  return (
    <div className="space-y-4">
      {technicalSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {technicalSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSkill(skill.id)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {softSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Soft Skills</h3>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSkill(skill.id)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
