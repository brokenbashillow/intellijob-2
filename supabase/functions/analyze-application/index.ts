
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface SkillData {
  id: string;
  name: string;
  type: 'technical' | 'soft';
}

serve(async (req) => {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing application for user: ${userId}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First get the assessment to make sure it exists
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from("seeker_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentError) {
      console.error("Error fetching assessment:", assessmentError);
      return new Response(
        JSON.stringify({ error: assessmentError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!assessment) {
      console.error("No assessment found for user");
      return new Response(
        JSON.stringify({ error: "No assessment found for user" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log the assessment data for debugging
    console.log("Assessment data:", assessment);
    console.log("Technical skills in assessment:", assessment.technical_skills);
    console.log("Soft skills in assessment:", assessment.soft_skills);

    // Function to validate and convert skills to proper format
    const validateAndHandleSkills = async (skillIds: string[] | null, skillType: 'technical' | 'soft') => {
      if (!skillIds || skillIds.length === 0) return [];
      
      console.log(`Processing ${skillType} skills:`, skillIds);
      
      // First check if skills are valid UUIDs
      const validUuidSkills = skillIds.filter(id => {
        return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });
      
      // If all skills are valid UUIDs, use them directly
      if (validUuidSkills.length === skillIds.length) {
        console.log(`All ${skillType} skills are valid UUIDs, using directly`);
        return validUuidSkills;
      }
      
      // For any non-UUID skills, try to look them up by name or slug
      console.log(`Some ${skillType} skills aren't valid UUIDs, trying to match by name`);
      
      // Get all skills from the database for matching
      const { data: allSkills, error: skillsError } = await supabaseClient
        .from("skills")
        .select("id, name");
        
      if (skillsError) {
        console.error(`Error fetching all skills for ${skillType} matching:`, skillsError);
        return validUuidSkills; // Return the valid UUIDs we already found
      }
      
      // For each non-UUID skill, try to find a match
      const skillMatches = new Set([...validUuidSkills]); // Start with valid UUIDs
      
      for (const skillId of skillIds) {
        if (validUuidSkills.includes(skillId)) continue; // Skip already validated UUIDs
        
        // Try to match by name or slug-like ID
        const matchingSkill = allSkills.find(s => 
          s.name.toLowerCase() === skillId.toLowerCase() || 
          s.name.toLowerCase().replace(/\s+/g, '-') === skillId.toLowerCase()
        );
        
        if (matchingSkill) {
          console.log(`Found matching skill for '${skillId}': ${matchingSkill.id} (${matchingSkill.name})`);
          skillMatches.add(matchingSkill.id);
        } else {
          console.warn(`No matching skill found for '${skillId}'`);
        }
      }
      
      return Array.from(skillMatches);
    };
    
    // Process technical and soft skills
    const validatedTechnicalSkills = await validateAndHandleSkills(assessment.technical_skills, 'technical');
    const validatedSoftSkills = await validateAndHandleSkills(assessment.soft_skills, 'soft');
    
    // Update the assessment with the validated skills if needed
    if (
      (assessment.technical_skills && validatedTechnicalSkills.length !== assessment.technical_skills.length) || 
      (assessment.soft_skills && validatedSoftSkills.length !== assessment.soft_skills.length)
    ) {
      console.log("Updating assessment with validated skills");
      const { error: updateSkillsError } = await supabaseClient
        .from("seeker_assessments")
        .update({ 
          technical_skills: validatedTechnicalSkills.length > 0 ? validatedTechnicalSkills : [],
          soft_skills: validatedSoftSkills.length > 0 ? validatedSoftSkills : []
        })
        .eq("id", assessment.id);
        
      if (updateSkillsError) {
        console.error("Error updating assessment with validated skills:", updateSkillsError);
      } else {
        console.log("Successfully updated assessment with validated skills");
      }
      
      // Update the assessment object for future use
      assessment.technical_skills = validatedTechnicalSkills.length > 0 ? validatedTechnicalSkills : [];
      assessment.soft_skills = validatedSoftSkills.length > 0 ? validatedSoftSkills : [];
    }

    // Fetch skill names from the database for the analysis
    let technicalSkillNames: string[] = [];
    let softSkillNames: string[] = [];
    
    if (validatedTechnicalSkills.length > 0) {
      const { data: techSkillsData } = await supabaseClient
        .from("skills")
        .select("name")
        .in("id", validatedTechnicalSkills);
        
      if (techSkillsData && techSkillsData.length > 0) {
        technicalSkillNames = techSkillsData.map(s => s.name);
      }
    }
    
    if (validatedSoftSkills.length > 0) {
      const { data: softSkillsData } = await supabaseClient
        .from("skills")
        .select("name")
        .in("id", validatedSoftSkills);
        
      if (softSkillsData && softSkillsData.length > 0) {
        softSkillNames = softSkillsData.map(s => s.name);
      }
    }

    // Then get resume data if it exists
    const { data: resumeData, error: resumeError } = await supabaseClient
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (resumeError && resumeError.code !== "PGRST116") {
      console.error("Error fetching resume:", resumeError);
    }

    // Prepare analysis results
    const analysisResults = {
      timestamp: new Date().toISOString(),
      resume_status: resumeData ? "complete" : "incomplete",
      technical_skills: technicalSkillNames,
      soft_skills: softSkillNames,
      skill_count: technicalSkillNames.length + softSkillNames.length,
      job_readiness: technicalSkillNames.length >= 3 && softSkillNames.length >= 2 ? "high" : "medium",
      recommendations: []
    };

    // Add recommendations based on assessment
    if (technicalSkillNames.length < 3) {
      analysisResults.recommendations.push("Add more technical skills to improve job matches");
    }
    
    if (softSkillNames.length < 2) {
      analysisResults.recommendations.push("Add more soft skills to showcase your workplace abilities");
    }
    
    if (!resumeData || !resumeData.work_experience || resumeData.work_experience.length === 0) {
      analysisResults.recommendations.push("Add work experience to your resume");
    }

    console.log("Analysis results:", analysisResults);

    // Update the assessment with the analysis results
    const { error: updateError } = await supabaseClient
      .from("seeker_assessments")
      .update({ analysis_results: analysisResults })
      .eq("id", assessment.id);

    if (updateError) {
      console.error("Error updating assessment with analysis:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysisResults }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
