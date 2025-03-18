
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoading(true);
        
        // First, fetch all skill categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');
          
        if (categoriesError) {
          throw categoriesError;
        }
        
        // Map the database results to our expected format
        const formattedCategories: SkillCategory[] = categoriesData.map(category => ({
          id: category.id,
          name: category.name,
          type: category.type as 'technical' | 'soft'
        }));
        
        // Then fetch all skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');
          
        if (skillsError) {
          throw skillsError;
        }
        
        // Map the database results to our expected format
        const formattedSkills: Skill[] = skillsData.map(skill => ({
          id: skill.id,
          name: skill.name,
          category_id: skill.category_id || ''
        }));
        
        console.log("Fetched skill categories from database:", formattedCategories);
        console.log("Fetched skills from database:", formattedSkills);
        
        // If we have no skills in the database, use our fallback data
        if (formattedCategories.length === 0 || formattedSkills.length === 0) {
          console.log("No skills found in database, using fallback data");
          await populateSkillsData();
          return;
        }
        
        setCategories(formattedCategories);
        setSkills(formattedSkills);
        
      } catch (error) {
        console.error('Error with skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data. Using fallback data instead.",
        });
        
        // If there's an error, try to populate the database with our fallback data
        await populateSkillsData();
      } finally {
        setLoading(false);
      }
    };

    // Fallback function to populate the database with our initial data if needed
    const populateSkillsData = async () => {
      try {
        // Import the custom skill data
        const { customSkillCategories, customSkills } = await import('@/data/skillsData');
        
        console.log("Using fallback skill data");
        setCategories(customSkillCategories);
        setSkills(customSkills);

        // Try to populate the database with our fallback data
        // Only do this if we're authenticated
        const { data: user } = await supabase.auth.getUser();
        if (user && user.user) {
          console.log("Attempting to populate database with fallback skills data");
          
          // First check if categories exist
          const { data: existingCategories } = await supabase
            .from('skill_categories')
            .select('count(*)', { count: 'exact' });
            
          if (!existingCategories || existingCategories.count === 0) {
            // Insert categories first
            for (const category of customSkillCategories) {
              await supabase
                .from('skill_categories')
                .upsert({
                  id: category.id,
                  name: category.name,
                  type: category.type
                });
            }
            
            console.log("Inserted skill categories into database");
            
            // Then insert skills
            for (const skill of customSkills) {
              await supabase
                .from('skills')
                .upsert({
                  id: skill.id,
                  name: skill.name,
                  category_id: skill.category_id
                });
            }
            
            console.log("Inserted skills into database");
          }
        }
      } catch (error) {
        console.error("Error populating skills data:", error);
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills, loading };
};

// Export the hook by default
export default useSkillsData;
