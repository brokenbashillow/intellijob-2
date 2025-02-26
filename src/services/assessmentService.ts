
import { FormData } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

export const saveAssessmentData = async (formData: FormData) => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  // Save the assessment data
  const { error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
    });

  if (assessmentError) throw assessmentError;

  // Save technical skills
  const technicalSkillsData = formData.technicalSkills.map(skillId => ({
    user_id: user.data.user!.id,
    skill_id: skillId,
    skill_type: 'technical'
  }));

  const { error: technicalSkillsError } = await supabase
    .from('user_skills')
    .insert(technicalSkillsData);

  if (technicalSkillsError) throw technicalSkillsError;

  // Save soft skills
  const softSkillsData = formData.softSkills.map(skillId => ({
    user_id: user.data.user!.id,
    skill_id: skillId,
    skill_type: 'soft'
  }));

  const { error: softSkillsError } = await supabase
    .from('user_skills')
    .insert(softSkillsData);

  if (softSkillsError) throw softSkillsError;

  // Update location in profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      country: formData.location.country,
      province: formData.location.province,
      city: formData.location.city,
    })
    .eq('id', user.data.user.id);

  if (profileError) throw profileError;
};
