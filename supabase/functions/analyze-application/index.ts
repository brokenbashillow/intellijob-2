
// Follow this setup guide to integrate the Deno runtime and Gemini into your Supabase database: https://deno.com/supabase
// This edge function uses the Gemini API to analyze user application data

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Analyzing application for user:", userId);

    // Initialize Supabase client with admin rights from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not set");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get resume data for the user
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (resumeError) {
      throw new Error(`Error fetching resume data: ${resumeError.message}`);
    }

    if (!resumeData) {
      throw new Error("No resume data found for user");
    }

    console.log("Retrieved resume data:", JSON.stringify(resumeData, null, 2));

    // Parse skills from resume data
    let skills = [];
    if (resumeData.skills && resumeData.skills.length > 0) {
      try {
        // Try to parse JSON strings into objects
        skills = resumeData.skills.map(skillString => {
          if (typeof skillString === 'string') {
            const parsed = JSON.parse(skillString);
            return {
              id: parsed.id,
              name: parsed.name,
              type: parsed.type
            };
          }
          return skillString;
        });
        console.log("Parsed skills from resume:", skills);
      } catch (error) {
        console.error("Error parsing skills from resume:", error);
      }
    }

    // If no skills in resume, get from user_skills table
    if (skills.length === 0) {
      console.log("No skills found in resume, checking user_skills table");
      
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skill_type,
          skills (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (skillsError) {
        throw new Error(`Error fetching user skills: ${skillsError.message}`);
      }

      if (skillsData && skillsData.length > 0) {
        skills = skillsData.map(skillData => ({
          id: skillData.skill_id,
          name: skillData.skills?.name || "Unknown Skill",
          type: skillData.skill_type
        }));
        console.log("Skills from user_skills table:", skills);
      }
    }

    // Prepare the prompt for Gemini API
    const formattedEducation = resumeData.education
      ? JSON.stringify(resumeData.education)
      : "No education data available";

    const formattedExperience = resumeData.work_experience
      ? JSON.stringify(resumeData.work_experience)
      : "No work experience data available";

    const formattedSkills = skills.length > 0
      ? JSON.stringify(skills)
      : "No skills data available";

    const formattedCertificates = resumeData.certificates
      ? JSON.stringify(resumeData.certificates)
      : "No certificates data available";

    const formattedReferences = resumeData.reference_list
      ? JSON.stringify(resumeData.reference_list)
      : "No references data available";

    const prompt = `
Given the following job application data, analyze and return a score from 0-100 based on education, experience, skills, certifications, and references.

Education: ${formattedEducation}
Work Experience: ${formattedExperience}
Skills: ${formattedSkills}
Certificates: ${formattedCertificates}
References: ${formattedReferences}

Only return the score for the education, experience, competency (the alignment of technical skills) and personality (the alignment of soft skills). Also return the overall score of each one and provide 2-3 comments about how each of the data aligns with each other.

Structure your response EXACTLY as a JSON object with this format:
{
  "education": {
    "score": [number between 0-100],
    "comment": [string with brief assessment]
  },
  "experience": {
    "score": [number between 0-100],
    "comment": [string with brief assessment]
  },
  "competency": {
    "score": [number between 0-100],
    "comment": [string with brief assessment]
  },
  "personality": {
    "score": [number between 0-100],
    "comment": [string with brief assessment]
  },
  "overall": {
    "score": [number between 0-100],
    "comments": [array of 2-3 strings with overall assessment]
  }
}
`;

    // Get Gemini API key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Gemini API key not set");
    }

    console.log("Sending request to Gemini API...");

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response:", JSON.stringify(geminiData, null, 2));

    // Extract the text content from Gemini's response
    const generatedText = geminiData.candidates[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error("Invalid or empty response from Gemini API");
    }

    // Try to parse the JSON from the generated text
    // First, let's find the JSON object in the response
    let jsonStart = generatedText.indexOf('{');
    let jsonEnd = generatedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Could not find valid JSON in Gemini's response");
    }
    
    const jsonString = generatedText.substring(jsonStart, jsonEnd);
    let analysis;
    
    try {
      analysis = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e, "JSON string:", jsonString);
      throw new Error("Failed to parse Gemini's response as JSON");
    }

    // Store the analysis results in the user's assessment record
    const { data: assessmentData, error: assessmentFetchError } = await supabase
      .from('seeker_assessments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (assessmentFetchError) {
      throw new Error(`Error fetching assessment: ${assessmentFetchError.message}`);
    }

    if (assessmentData) {
      // Update existing assessment
      const { error: updateError } = await supabase
        .from('seeker_assessments')
        .update({
          analysis_results: analysis
        })
        .eq('id', assessmentData.id);

      if (updateError) {
        throw new Error(`Error updating assessment: ${updateError.message}`);
      }
    } else {
      // Create new assessment
      const { error: insertError } = await supabase
        .from('seeker_assessments')
        .insert({
          user_id: userId,
          education: "Generated from resume",
          experience: "Generated from resume",
          analysis_results: analysis
        });

      if (insertError) {
        throw new Error(`Error creating assessment: ${insertError.message}`);
      }
    }

    console.log("Analysis completed and saved successfully");

    // Return success response with analysis data
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in analyze-application function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
