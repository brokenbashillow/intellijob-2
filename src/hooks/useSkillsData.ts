
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { SkillCategory, Skill } from "@/types/skills";
import { customSkillCategories, customSkills } from "@/data/skillsData";

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkillsData = () => {
      try {
        setLoading(true);
        console.log("Loading hardcoded skill data");
        
        // Use the hardcoded data directly
        setCategories(customSkillCategories);
        setSkills(customSkills);
      } catch (error) {
        console.error('Error loading skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data."
        });
      } finally {
        setLoading(false);
      }
    };

    loadSkillsData();
  }, [toast]);

  return { categories, skills, loading };
};

export default useSkillsData;
