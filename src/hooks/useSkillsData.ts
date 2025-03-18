
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching skills data...");
        
        // Fetch categories with proper typing
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }

        // Fetch skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        if (skillsError) {
          console.error('Error fetching skills:', skillsError);
          throw skillsError;
        }

        console.log("Fetched categories:", categoriesData?.length || 0, "items");
        console.log("Fetched skills:", skillsData?.length || 0, "items");
        
        if (categoriesData?.length === 0) {
          console.warn("No skill categories found in the database");
        }
        
        if (skillsData?.length === 0) {
          console.warn("No skills found in the database");
        }

        setCategories(categoriesData || []);
        setSkills(skillsData || []);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills, isLoading };
};
