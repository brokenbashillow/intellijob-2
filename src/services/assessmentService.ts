
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
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }

  const assessmentId = assessmentData.id;

  // Save technical skills
  if (formData.technicalSkills && formData.technicalSkills.length > 0) {
    const technicalSkillsData = formData.technicalSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      skill_type: 'technical',
      assessment_id: assessmentId
    }));
    
    const { error: techSkillsError } = await supabase
      .from('user_skills')
      .insert(technicalSkillsData);
      
    if (techSkillsError) throw techSkillsError;
  }
  
  // Save soft skills
  if (formData.softSkills && formData.softSkills.length > 0) {
    const softSkillsData = formData.softSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      skill_type: 'soft',
      assessment_id: assessmentId
    }));
    
    const { error: softSkillsError } = await supabase
      .from('user_skills')
      .insert(softSkillsData);
      
    if (softSkillsError) throw softSkillsError;
  }
  
  // Save location data to the profile
  if (formData.location) {
    const { error: locationError } = await supabase
      .from('profiles')
      .update({
        country: formData.location.country,
        province: formData.location.province,
        city: formData.location.city
      })
      .eq('id', user.data.user.id);
      
    if (locationError) throw locationError;
  }

  return assessmentId;
};
