
import { supabase } from "@/integrations/supabase/client";

type AssessmentData = {
  education: string;
  experience: string;
  technicalSkills: string[];
  softSkills: string[];
};

export const saveAssessmentData = async (formData: AssessmentData): Promise<string> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  // Ensure we always have arrays for skills, never null
  const technicalSkills = formData.technicalSkills || [];
  const softSkills = formData.softSkills || [];
  
  console.log("Processing technical skills for saving:", technicalSkills);
  console.log("Processing soft skills for saving:", softSkills);

  // Save the assessment data - ensure we're passing empty arrays instead of null
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: technicalSkills.length > 0 ? technicalSkills : [],
      soft_skills: softSkills.length > 0 ? softSkills : []
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }
  
  console.log("Assessment saved successfully with ID:", assessmentData.id);
  console.log("Technical skills saved to assessment:", technicalSkills);
  console.log("Soft skills saved to assessment:", softSkills);

  // Clear previous user skills before adding new ones
  try {
    const { error: deleteSkillsError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.data.user.id);
      
    if (deleteSkillsError) {
      console.error("Error deleting existing skills:", deleteSkillsError);
    } else {
      console.log("Successfully deleted previous user skills");
    }
  } catch (e) {
    console.error("Exception deleting user skills:", e);
  }

  // Save each technical skill to the user_skills table
  if (technicalSkills.length > 0) {
    try {
      const technicalSkillsData = technicalSkills.map(skillId => ({
        user_id: user.data.user.id,
        skill_id: skillId,
        assessment_id: assessmentData.id,
        skill_type: 'technical'
      }));

      console.log("Technical skills data to insert:", technicalSkillsData);
      
      const { error: technicalSkillsError } = await supabase
        .from('user_skills')
        .insert(technicalSkillsData);

      if (technicalSkillsError) {
        console.error("Error saving technical skills:", technicalSkillsError);
      } else {
        console.log("Technical skills saved successfully to user_skills table");
      }
    } catch (e) {
      console.error("Exception saving technical skills:", e);
    }
  } else {
    console.log("No technical skills to save");
  }

  // Save each soft skill to the user_skills table
  if (softSkills.length > 0) {
    try {
      const softSkillsData = softSkills.map(skillId => ({
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
      } else {
        console.log("Soft skills saved successfully to user_skills table");
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
