
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        if (skillsError) throw skillsError;

        setCategories(categoriesData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data. Please try again.",
        });
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills };
};
