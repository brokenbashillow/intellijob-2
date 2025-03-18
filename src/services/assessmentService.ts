
import { FormData } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

export const saveAssessmentData = async (formData: FormData): Promise<string> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  // Save the assessment data
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: formData.technicalSkills,
      soft_skills: formData.softSkills,
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }

  // Save each technical skill to the user_skills table
  if (formData.technicalSkills && formData.technicalSkills.length > 0) {
    const technicalSkillsData = formData.technicalSkills.map(skillId => ({
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
    }
  }

  // Save each soft skill to the user_skills table
  if (formData.softSkills && formData.softSkills.length > 0) {
    const softSkillsData = formData.softSkills.map(skillId => ({
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
    }
  }

  // Return the assessment ID which we'll need for other operations
  return assessmentData.id;
};
