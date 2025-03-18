
import { useSkillsData } from "@/hooks/useSkillsData";
import CategorySkillsStep from "./CategorySkillsStep";

interface TechnicalSkillsStepProps {
  technicalSkills: string[];
  setTechnicalSkills: (skills: string[]) => void;
}

const TechnicalSkillsStep = ({ 
  technicalSkills, 
  setTechnicalSkills 
}: TechnicalSkillsStepProps) => {
  const { categories, skills, loading } = useSkillsData();

  // Log to help with debugging
  console.log("Rendering TechnicalSkillsStep with skills:", technicalSkills);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Technical Skills</h2>
      <p className="text-muted-foreground">
        Select 3-5 technical skills that you possess
      </p>
      
      {loading ? (
        <div className="text-center py-4">Loading skills...</div>
      ) : (
        <CategorySkillsStep
          title="Select Technical Skills"
          selectedSkills={technicalSkills}
          setSelectedSkills={setTechnicalSkills}
          categories={categories}
          skills={skills}
          type="technical"
        />
      )}
    </div>
  );
};

export default TechnicalSkillsStep;
