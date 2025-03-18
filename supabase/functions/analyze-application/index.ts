
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

    // Validate technical_skills and soft_skills to ensure they're valid UUIDs
    if (assessment.technical_skills) {
      const validTechnicalSkills = assessment.technical_skills.filter(id => {
        // Check if the ID is a valid UUID (basic check)
        return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });
      
      if (validTechnicalSkills.length !== assessment.technical_skills.length) {
        console.warn(
          "Some technical skills had invalid UUIDs. Original:", 
          assessment.technical_skills, 
          "Filtered:", 
          validTechnicalSkills
        );
        assessment.technical_skills = validTechnicalSkills;
      }
    }
    
    if (assessment.soft_skills) {
      const validSoftSkills = assessment.soft_skills.filter(id => {
        // Check if the ID is a valid UUID (basic check)
        return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });
      
      if (validSoftSkills.length !== assessment.soft_skills.length) {
        console.warn(
          "Some soft skills had invalid UUIDs. Original:", 
          assessment.soft_skills, 
          "Filtered:", 
          validSoftSkills
        );
        assessment.soft_skills = validSoftSkills;
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
      return new Response(
        JSON.stringify({ error: resumeError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract and process skills from resume if available
    let skills: SkillData[] = [];
    if (resumeData && resumeData.skills && resumeData.skills.length > 0) {
      try {
        console.log("Processing skills from resume data:", resumeData.skills);
        
        // Try to parse JSON strings into objects
        skills = resumeData.skills.map(skillString => {
          if (typeof skillString === 'string') {
            try {
              const parsed = JSON.parse(skillString);
              return {
                id: parsed.id,
                name: parsed.name,
                type: parsed.type
              };
            } catch (e) {
              console.error("Error parsing skill JSON:", e, skillString);
              return null;
            }
          }
          return skillString;
        }).filter(skill => skill !== null);
        
        console.log("Parsed skills from resume:", skills);
      } catch (e) {
        console.error("Error processing skills from resume:", e);
      }
    } else if (!skills.length) {
      // If no skills in resume, fetch from user_skills
      console.log("No skills in resume, fetching from user_skills");
      
      const { data: userSkills, error: userSkillsError } = await supabaseClient
        .from("user_skills")
        .select(`
          skill_id,
          skill_type,
          skills (
            id,
            name
          )
        `)
        .eq("user_id", userId);

      if (userSkillsError) {
        console.error("Error fetching user skills:", userSkillsError);
      } else if (userSkills && userSkills.length > 0) {
        console.log("Found user skills:", userSkills);
        
        skills = userSkills.map(skillData => ({
          id: skillData.skill_id,
          name: skillData.skills?.name || "Unknown Skill",
          type: skillData.skill_type as 'technical' | 'soft'
        }));
        
        console.log("Processed user skills:", skills);
      } else {
        console.log("No user skills found");
        
        // As a fallback, if we have valid skill IDs in the assessment, fetch those skills directly
        if (assessment.technical_skills && assessment.technical_skills.length > 0) {
          const { data: techSkills, error: techSkillsError } = await supabaseClient
            .from("skills")
            .select("id, name")
            .in("id", assessment.technical_skills);
            
          if (techSkillsError) {
            console.error("Error fetching technical skills by IDs:", techSkillsError);
          } else if (techSkills) {
            const technicalSkillsData = techSkills.map(skill => ({
              id: skill.id,
              name: skill.name,
              type: 'technical' as const
            }));
            skills.push(...technicalSkillsData);
            console.log("Added technical skills from assessment:", technicalSkillsData);
          }
        }
        
        if (assessment.soft_skills && assessment.soft_skills.length > 0) {
          const { data: softSkills, error: softSkillsError } = await supabaseClient
            .from("skills")
            .select("id, name")
            .in("id", assessment.soft_skills);
            
          if (softSkillsError) {
            console.error("Error fetching soft skills by IDs:", softSkillsError);
          } else if (softSkills) {
            const softSkillsData = softSkills.map(skill => ({
              id: skill.id,
              name: skill.name,
              type: 'soft' as const
            }));
            skills.push(...softSkillsData);
            console.log("Added soft skills from assessment:", softSkillsData);
          }
        }
      }
    }

    // Gather technical and soft skills separately
    const technicalSkills = skills.filter(skill => skill.type === 'technical').map(skill => skill.name);
    const softSkills = skills.filter(skill => skill.type === 'soft').map(skill => skill.name);

    console.log("Technical skills:", technicalSkills);
    console.log("Soft skills:", softSkills);

    // Prepare analysis results
    const analysisResults = {
      timestamp: new Date().toISOString(),
      resume_status: resumeData ? "complete" : "incomplete",
      technical_skills: technicalSkills,
      soft_skills: softSkills,
      skill_count: technicalSkills.length + softSkills.length,
      job_readiness: technicalSkills.length >= 3 && softSkills.length >= 2 ? "high" : "medium",
      recommendations: []
    };

    // Add recommendations based on assessment
    if (technicalSkills.length < 3) {
      analysisResults.recommendations.push("Add more technical skills to improve job matches");
    }
    
    if (softSkills.length < 2) {
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
