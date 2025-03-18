
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSkillsData } from "@/hooks/useSkillsData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SoftSkillsStepProps {
  softSkills: string[];
  setSoftSkills: (skills: string[]) => void;
}

const SoftSkillsStep = ({ 
  softSkills, 
  setSoftSkills 
}: SoftSkillsStepProps) => {
  const { categories, skills, loading } = useSkillsData();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  
  const handleSkillToggle = (skillId: string) => {
    if (softSkills.includes(skillId)) {
      setSoftSkills(softSkills.filter(s => s !== skillId));
    } else {
      if (softSkills.length >= 5) {
        return; // Maximum limit reached
      }
      setSoftSkills([...softSkills, skillId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Group skills by category - filter for soft skills only
  const skillsByCategory = categories
    .filter(category => category.type === 'soft')
    .map(category => ({
      category,
      skills: skills.filter(skill => skill.category_id === category.id)
    }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Soft Skills</h2>
      <p className="text-muted-foreground">
        Select 3-5 soft skills that you possess
      </p>
      
      {softSkills.length < 3 ? (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least {3 - softSkills.length} more soft skills
          </AlertDescription>
        </Alert>
      ) : softSkills.length >= 5 ? (
        <Alert>
          <AlertDescription>
            Maximum of 5 soft skills selected
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {softSkills.length} skills selected
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading skills...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsByCategory.map(({ category, skills }) => (
            <div key={category.id} className="border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="font-medium">{category.name}</span>
                {openCategories[category.id] ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              {openCategories[category.id] && (
                <div className="p-3 border-t space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`soft-skill-${skill.id}`}
                        checked={softSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                        disabled={softSkills.length >= 5 && !softSkills.includes(skill.id)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`soft-skill-${skill.id}`}
                        className="text-sm cursor-pointer leading-tight"
                      >
                        {skill.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SoftSkillsStep;
