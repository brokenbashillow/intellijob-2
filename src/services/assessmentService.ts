
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
  
  console.log("Saving technical skills:", technicalSkills);
  console.log("Saving soft skills:", softSkills);

  // Save the assessment data
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: technicalSkills,
      soft_skills: softSkills
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }
  
  console.log("Assessment saved successfully with ID:", assessmentData.id);

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

  // Save all skills to the user_skills table
  const allUserSkills = [
    ...technicalSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      assessment_id: assessmentData.id,
      skill_type: 'technical'
    })),
    ...softSkills.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      assessment_id: assessmentData.id,
      skill_type: 'soft'
    }))
  ];

  if (allUserSkills.length > 0) {
    try {
      const { error: userSkillsError } = await supabase
        .from('user_skills')
        .insert(allUserSkills);

      if (userSkillsError) {
        console.error("Error saving user skills:", userSkillsError);
      } else {
        console.log("All user skills saved successfully");
      }
    } catch (e) {
      console.error("Exception saving user skills:", e);
    }
  }

  // Try to call the analyze-application function, but don't block if it fails
  try {
    console.log("Calling analyze-application function with userId:", user.data.user.id);
    await supabase.functions.invoke('analyze-application', {
      body: { userId: user.data.user.id }
    });
  } catch (e) {
    console.error("Exception calling analyze-application:", e);
    // Don't throw here, as we've already saved the assessment data
  }

  // Return the assessment ID
  return assessmentData.id;
};
