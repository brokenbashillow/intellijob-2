
import { FormData } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

export const saveAssessmentData = async (formData: FormData): Promise<string> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  console.log("Saving assessment data:", formData);

  // Save the assessment data
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: formData.technicalSkills,
      soft_skills: formData.softSkills
    })
    .select()
    .single();

  if (assessmentError) {
    console.error("Error saving assessment:", assessmentError);
    throw assessmentError;
  }
  
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }

  console.log("Assessment created with ID:", assessmentData.id);
  console.log("Technical skills to save:", formData.technicalSkills);
  console.log("Soft skills to save:", formData.softSkills);

  // Fetch the actual UUIDs for the technical skills
  if (formData.technicalSkills && formData.technicalSkills.length > 0) {
    try {
      // Query the skills table to get the real UUIDs for the skills by name
      const { data: technicalSkillsData, error: skillsError } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', formData.technicalSkills);
      
      if (skillsError) {
        console.error("Error fetching technical skills:", skillsError);
        throw skillsError;
      }
      
      if (technicalSkillsData && technicalSkillsData.length > 0) {
        console.log("Found skill UUIDs:", technicalSkillsData);
        
        const technicalSkillsToInsert = technicalSkillsData.map(skill => ({
          user_id: user.data.user!.id,
          skill_id: skill.id, // Use the actual UUID from the database
          skill_type: 'technical',
          assessment_id: assessmentData.id
        }));

        const { error: technicalSkillsError } = await supabase
          .from('user_skills')
          .insert(technicalSkillsToInsert);

        if (technicalSkillsError) {
          console.error("Error saving technical skills:", technicalSkillsError);
          // Continue execution even if there's an error with skills
        }
      } else {
        console.warn("No matching technical skills found in the database");
      }
    } catch (error) {
      console.error("Error processing technical skills:", error);
    }
  }

  // Fetch the actual UUIDs for the soft skills
  if (formData.softSkills && formData.softSkills.length > 0) {
    try {
      // Query the skills table to get the real UUIDs for the skills by name
      const { data: softSkillsData, error: skillsError } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', formData.softSkills);
      
      if (skillsError) {
        console.error("Error fetching soft skills:", skillsError);
        throw skillsError;
      }
      
      if (softSkillsData && softSkillsData.length > 0) {
        console.log("Found soft skill UUIDs:", softSkillsData);
        
        const softSkillsToInsert = softSkillsData.map(skill => ({
          user_id: user.data.user!.id,
          skill_id: skill.id, // Use the actual UUID from the database
          skill_type: 'soft',
          assessment_id: assessmentData.id
        }));

        const { error: softSkillsError } = await supabase
          .from('user_skills')
          .insert(softSkillsToInsert);

        if (softSkillsError) {
          console.error("Error saving soft skills:", softSkillsError);
          // Continue execution even if there's an error with skills
        }
      } else {
        console.warn("No matching soft skills found in the database");
      }
    } catch (error) {
      console.error("Error processing soft skills:", error);
    }
  }

  // Return the assessment ID which we'll need for other operations
  return assessmentData.id;
};
