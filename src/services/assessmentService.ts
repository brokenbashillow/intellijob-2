
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

  // Save technical skills
  if (formData.technicalSkills && formData.technicalSkills.length > 0) {
    const technicalSkillsToInsert = formData.technicalSkills.map(skillId => ({
      user_id: user.data.user!.id,
      skill_id: skillId,
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
  }

  // Save soft skills
  if (formData.softSkills && formData.softSkills.length > 0) {
    const softSkillsToInsert = formData.softSkills.map(skillId => ({
      user_id: user.data.user!.id,
      skill_id: skillId,
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
  }

  // Return the assessment ID which we'll need for other operations
  return assessmentData.id;
};
