
import { FormData } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

export const saveAssessmentData = async (formData: FormData): Promise<string> => {
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
    
    // If all IDs are valid UUIDs, return them directly
    if (validUuidIds.length === skillIds.length) {
      console.log(`All ${skillIds.length} ${skillType} skill IDs are valid UUIDs`);
      return validUuidIds;
    }
    
    // For non-UUID strings, try to find matching skills in the database
    console.log(`Trying to match ${skillType} skill names to IDs`);
    
    try {
      // Get all skills to match against
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
