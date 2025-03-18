
import { useState } from "react";
import { SkillItem } from "@/types/resume";
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface SkillsSectionProps {
  skills: SkillItem[];
  setSkills: (skills: SkillItem[]) => void;
}

export function SkillsSection({ skills, setSkills }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const technicalSkills = skills.filter(skill => skill.type === 'technical');
  const softSkills = skills.filter(skill => skill.type === 'soft');

  console.log("Current skills in SkillsSection:", skills);

  const removeSkill = (skillId: string) => {
    console.log("Removing skill with ID:", skillId);
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  // Helper function to generate proper UUIDs
  const generateUUID = (): string => {
    try {
      // Use crypto.randomUUID() for modern browsers
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      
      // Fallback implementation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch (error) {
      console.error("Error generating UUID:", error);
      // Last resort fallback
      return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check if we've reached the limit of 5 skills for the selected type
    const currentSkillsOfType = skills.filter(skill => skill.type === skillType);
    if (currentSkillsOfType.length >= 5) {
      toast({
        variant: "destructive",
        title: "Skill Limit Reached",
        description: `You can only add up to 5 ${skillType} skills.`
      });
      return;
    }

    // Check if the skill already exists with the same name and type
    const skillExists = skills.some(
      skill => skill.name.toLowerCase() === newSkill.trim().toLowerCase() && skill.type === skillType
    );
    
    if (skillExists) {
      toast({
        variant: "destructive",
        title: "Duplicate Skill",
        description: "This skill already exists in your list."
      });
      return;
    }

    // Generate a proper UUID
    const newSkillId = generateUUID();
    console.log("Generated UUID for new skill:", newSkillId);

    const newSkillItem: SkillItem = {
      id: newSkillId,
      name: newSkill.trim(),
      type: skillType,
    };

    console.log("Adding new skill:", newSkillItem);
    setSkills([...skills, newSkillItem]);
    setNewSkill("");
    setDialogOpen(false);
    
    toast({
      title: "Skill Added",
      description: `${newSkill} has been added to your ${skillType} skills.`
    });
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
              <DialogDescription>
                Add skills that highlight your technical abilities and soft skills.
              </DialogDescription>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
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
