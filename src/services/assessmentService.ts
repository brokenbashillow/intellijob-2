
import { supabase } from "@/integrations/supabase/client";

type AssessmentData = {
  education: string;
  experience: string;
  technicalSkills?: string[];
  softSkills?: string[];
};

export const saveAssessmentData = async (formData: AssessmentData): Promise<string> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("No authenticated user found");
  }

  // Function to process and validate skill IDs
  const processSkillIds = async (skillIds: string[] | undefined, skillType: 'technical' | 'soft') => {
    if (!skillIds || skillIds.length === 0) return [];
    
    console.log(`Processing ${skillType} skills:`, skillIds);
    
    // First check if all IDs are already valid UUIDs
    const validUuidIds = skillIds.filter(id => {
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isValidUuid) {
        console.warn(`Invalid UUID format for ${skillType} skill: ${id}`);
      }
      return isValidUuid;
    });
    
    // Get all skills to match against
    try {
      const { data: allSkills, error: skillsError } = await supabase
        .from('skills')
        .select('id, name');
        
      if (skillsError) {
        console.error(`Error fetching skills for ${skillType} matching:`, skillsError);
        return validUuidIds; // Return at least the valid UUIDs
      }
      
      const skillMatches = new Set([...validUuidIds]); // Start with valid UUIDs
      
      // Try to match remaining skills by name
      for (const skillId of skillIds) {
        if (validUuidIds.includes(skillId)) continue; // Skip already validated UUIDs
        
        // Try to match by name or slug-like ID
        const matchingSkill = allSkills.find(skill => 
          skill.name.toLowerCase() === skillId.toLowerCase() || 
          skill.name.toLowerCase().replace(/\s+/g, '-') === skillId.toLowerCase()
        );
        
        if (matchingSkill) {
          console.log(`Found matching skill for '${skillId}': ${matchingSkill.id} (${matchingSkill.name})`);
          skillMatches.add(matchingSkill.id);
        } else {
          console.warn(`No matching skill found for '${skillId}'`);
        }
      }
      
      const processedSkills = Array.from(skillMatches);
      console.log(`Processed ${processedSkills.length} ${skillType} skills (from original ${skillIds.length})`);
      return processedSkills;
      
    } catch (error) {
      console.error(`Error processing ${skillType} skills:`, error);
      return validUuidIds; // Return at least the valid UUIDs
    }
  };
  
  // Process and validate both technical and soft skills
  const validTechnicalSkills = await processSkillIds(formData.technicalSkills, 'technical');
  const validSoftSkills = await processSkillIds(formData.softSkills, 'soft');

  console.log("Final validated technical skills:", validTechnicalSkills);
  console.log("Final validated soft skills:", validSoftSkills);

  // Save the assessment data - ensure we're passing empty arrays instead of null
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('seeker_assessments')
    .insert({
      user_id: user.data.user.id,
      education: formData.education,
      experience: formData.experience,
      technical_skills: validTechnicalSkills.length > 0 ? validTechnicalSkills : [],
      soft_skills: validSoftSkills.length > 0 ? validSoftSkills : []
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;
  if (!assessmentData || !assessmentData.id) {
    throw new Error("Failed to create assessment");
  }
  
  console.log("Assessment saved successfully with ID:", assessmentData.id);
  console.log("Technical skills saved to assessment:", validTechnicalSkills);
  console.log("Soft skills saved to assessment:", validSoftSkills);

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
      } else {
        console.log("Technical skills saved successfully to user_skills table");
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
