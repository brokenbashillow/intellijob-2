
import { FormData } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

export const saveAssessmentData = async (formData: FormData): Promise<string> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  // Validate that skills are properly formatted (UUIDs)
  const validateSkillIds = (skillIds: string[] | undefined) => {
    if (!skillIds || skillIds.length === 0) return [];
    
    // Check if each ID is a valid UUID
    const validatedIds = skillIds.filter(id => {
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isValidUuid) {
        console.warn(`Invalid skill ID format (not a UUID): ${id}`);
      }
      return isValidUuid;
    });
    
    console.log("Validated skill IDs:", validatedIds);
    return validatedIds;
  };
  
  const validTechnicalSkills = validateSkillIds(formData.technicalSkills);
  const validSoftSkills = validateSkillIds(formData.softSkills);

  // Save the assessment data
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: validTechnicalSkills.length > 0 ? validTechnicalSkills : null,
      soft_skills: validSoftSkills.length > 0 ? validSoftSkills : null,
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }
  
  console.log("Assessment saved successfully with ID:", assessmentData.id);
  console.log("Technical skills to save:", validTechnicalSkills);
  console.log("Soft skills to save:", validSoftSkills);

  // Save each technical skill to the user_skills table
  if (validTechnicalSkills.length > 0) {
    try {
      const technicalSkillsData = validTechnicalSkills.map(skillId => ({
        user_id: user.data.user.id,
        skill_id: skillId,
        assessment_id: assessmentData.id,
        skill_type: 'technical'
      }));

      const { error: technicalSkillsError } = await supabase
        .from('user_skills')
        .insert(technicalSkillsData);

      if (technicalSkillsError) {
        console.error("Error saving technical skills:", technicalSkillsError);
        // Continue execution, don't throw here to ensure assessment is still saved
      } else {
        console.log("Technical skills saved successfully");
      }
    } catch (e) {
      console.error("Exception saving technical skills:", e);
    }
  }

  // Save each soft skill to the user_skills table
  if (validSoftSkills.length > 0) {
    try {
      const softSkillsData = validSoftSkills.map(skillId => ({
        user_id: user.data.user.id,
        skill_id: skillId,
        assessment_id: assessmentData.id,
        skill_type: 'soft'
      }));

      const { error: softSkillsError } = await supabase
        .from('user_skills')
        .insert(softSkillsData);

      if (softSkillsError) {
        console.error("Error saving soft skills:", softSkillsError);
        // Continue execution, don't throw here to ensure assessment is still saved
      } else {
        console.log("Soft skills saved successfully");
      }
    } catch (e) {
      console.error("Exception saving soft skills:", e);
    }
  }

  // After saving the assessment, trigger the analyze-application function
  try {
    console.log("Calling analyze-application function with userId:", user.data.user.id);
    const { data, error } = await supabase.functions.invoke('analyze-application', {
      body: { userId: user.data.user.id }
    });
    
    if (error) {
      console.error("Error analyzing application:", error);
    } else {
      console.log("Analysis completed:", data);
    }
  } catch (e) {
    console.error("Exception calling analyze-application:", e);
  }

  // Return the assessment ID which we'll need for other operations
  return assessmentData.id;
};
