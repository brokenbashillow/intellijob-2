
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

  // Before saving user skills, look up the actual UUID values for these skills
  // from the skills table if they're not already UUIDs
  let technicalSkillIds = [...technicalSkills];
  let softSkillIds = [...softSkills];
  
  // If any skill IDs don't look like UUIDs, we need to look them up
  const nonUuidPattern = /^[a-z0-9-]+$/;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const needsLookup = technicalSkills.some(id => !uuidPattern.test(id)) || 
                      softSkills.some(id => !uuidPattern.test(id));
  
  if (needsLookup) {
    console.log("Need to look up skill UUIDs from names/slugs");
    
    // Get all the skills we need to map
    const allSkillIds = [...technicalSkills, ...softSkills].filter(id => nonUuidPattern.test(id) && !uuidPattern.test(id));
    
    if (allSkillIds.length > 0) {
      try {
        // First approach: try to find skills by ID directly (if they're using the skill IDs from our system)
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name')
          .in('id', allSkillIds);
          
        if (skillsError) {
          console.error("Error looking up skills by ID:", skillsError);
        } else if (skillsData && skillsData.length > 0) {
          console.log("Found skills by ID lookup:", skillsData);
          
          // Create a mapping from the skill ID/name to the actual UUID
          const skillMapping: Record<string, string> = {};
          skillsData.forEach(skill => {
            skillMapping[skill.id] = skill.id;
          });
          
          // Update the skill IDs
          technicalSkillIds = technicalSkills.map(id => skillMapping[id] || id);
          softSkillIds = softSkills.map(id => skillMapping[id] || id);
        } else {
          console.log("No skills found by ID lookup, trying by name");
          
          // Fallback: try to find skills by name
          const { data: nameSkillsData, error: nameSkillsError } = await supabase
            .from('skills')
            .select('id, name');
            
          if (nameSkillsError) {
            console.error("Error looking up skills by name:", nameSkillsError);
          } else if (nameSkillsData && nameSkillsData.length > 0) {
            console.log("Found skills by name lookup:", nameSkillsData);
            
            // Create a mapping from skill name to UUID and from ID to UUID
            const skillNameMapping: Record<string, string> = {};
            const skillIdMapping: Record<string, string> = {};
            
            nameSkillsData.forEach(skill => {
              skillNameMapping[skill.name.toLowerCase()] = skill.id;
              skillIdMapping[skill.id] = skill.id;
            });
            
            // Update the skill IDs, trying both direct ID and name lookup
            technicalSkillIds = technicalSkills.map(id => {
              // Check if we have a direct ID match
              if (skillIdMapping[id]) return skillIdMapping[id];
              // Try lowercase name matching
              return skillNameMapping[id.toLowerCase()] || id;
            });
            
            softSkillIds = softSkills.map(id => {
              // Check if we have a direct ID match
              if (skillIdMapping[id]) return skillIdMapping[id];
              // Try lowercase name matching
              return skillNameMapping[id.toLowerCase()] || id;
            });
          }
        }
      } catch (e) {
        console.error("Exception looking up skill IDs:", e);
      }
    }
  }
  
  console.log("Final technical skill IDs for user_skills:", technicalSkillIds);
  console.log("Final soft skill IDs for user_skills:", softSkillIds);

  // Save all skills to the user_skills table
  const allUserSkills = [
    ...technicalSkillIds.map(skillId => ({
      user_id: user.data.user.id,
      skill_id: skillId,
      assessment_id: assessmentData.id,
      skill_type: 'technical'
    })),
    ...softSkillIds.map(skillId => ({
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
