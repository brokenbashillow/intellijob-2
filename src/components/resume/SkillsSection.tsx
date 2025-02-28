
import { useState } from "react";
import { SkillItem } from "@/hooks/useResumeData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SkillsSectionProps {
  skills: SkillItem[];
  setSkills: (skills: SkillItem[]) => void;
}

export function SkillsSection({ skills, setSkills }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical");
  const [dialogOpen, setDialogOpen] = useState(false);

  const technicalSkills = skills.filter(skill => skill.type === 'technical');
  const softSkills = skills.filter(skill => skill.type === 'soft');

  const removeSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check if we've reached the limit of 5 skills for the selected type
    const currentSkillsOfType = skills.filter(skill => skill.type === skillType);
    if (currentSkillsOfType.length >= 5) {
      return; // Don't add if we've reached the limit
    }

    const newSkillItem: SkillItem = {
      id: Math.random().toString(36).substring(2, 11), // Generate a random ID
      name: newSkill.trim(),
      type: skillType,
    };

    setSkills([...skills, newSkillItem]);
    setNewSkill("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Skills</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="skill-type">Skill Type</Label>
                <Select value={skillType} onValueChange={(value: "technical" | "soft") => setSkillType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skill</SelectItem>
                    <SelectItem value="soft">Soft Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input 
                  id="skill-name" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name"
                />
              </div>
              <div className="pt-4">
                <Button 
                  onClick={addSkill} 
                  disabled={!newSkill.trim() || (skillType === "technical" && technicalSkills.length >= 5) || (skillType === "soft" && softSkills.length >= 5)}
                >
                  Add Skill
                </Button>
                {((skillType === "technical" && technicalSkills.length >= 5) || 
                  (skillType === "soft" && softSkills.length >= 5)) && (
                  <p className="text-sm text-red-500 mt-2">
                    Maximum of 5 {skillType} skills reached
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {technicalSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">
            Technical Skills ({technicalSkills.length}/5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {technicalSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {skill.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeSkill(skill.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {softSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">
            Soft Skills ({softSkills.length}/5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                {skill.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeSkill(skill.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-sm text-muted-foreground italic">
          No skills added yet. Click "Add Skill" to get started.
        </div>
      )}
    </div>
  );
}
