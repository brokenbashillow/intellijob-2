
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

  console.log("Created assessment:", assessmentData);
  const assessmentId = assessmentData.id;

  // Save technical skills
  if (formData.technicalSkills && formData.technicalSkills.length > 0) {
    console.log("Saving technical skills:", formData.technicalSkills);
    
    const technicalSkillsData = formData.technicalSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      skill_type: 'technical',
      assessment_id: assessmentId
    }));
    
    const { error: techSkillsError } = await supabase
      .from('user_skills')
      .insert(technicalSkillsData);
      
    if (techSkillsError) {
      console.error("Error saving technical skills:", techSkillsError);
      throw techSkillsError;
    }
  }
  
  // Save soft skills
  if (formData.softSkills && formData.softSkills.length > 0) {
    console.log("Saving soft skills:", formData.softSkills);
    
    const softSkillsData = formData.softSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      skill_type: 'soft',
      assessment_id: assessmentId
    }));
    
    const { error: softSkillsError } = await supabase
      .from('user_skills')
      .insert(softSkillsData);
      
    if (softSkillsError) {
      console.error("Error saving soft skills:", softSkillsError);
      throw softSkillsError;
    }
  }
  
  // Save location data to the profile
  if (formData.location) {
    console.log("Saving location data:", formData.location);
    
    const { error: locationError } = await supabase
      .from('profiles')
      .update({
        country: formData.location.country,
        province: formData.location.province,
        city: formData.location.city
      })
      .eq('id', user.data.user.id);
      
    if (locationError) {
      console.error("Error saving location:", locationError);
      throw locationError;
    }
  }

  return assessmentId;
};
