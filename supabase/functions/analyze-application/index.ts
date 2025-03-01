
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabase = supabaseClient(req);
    
    // Fetch user's resume data
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Fetch user's skills
    const { data: userSkillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        skill_type,
        skills (
          name
        )
      `)
      .eq('user_id', userId);
    
    // Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('seeker_assessments')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (resumeError || skillsError || assessmentError) {
      throw new Error("Error fetching data");
    }

    // Prepare the data object to analyze
    const technicalSkills = userSkillsData
      ?.filter(skill => skill.skill_type === 'technical')
      .map(skill => skill.skills.name) || [];
    
    const softSkills = userSkillsData
      ?.filter(skill => skill.skill_type === 'soft')
      .map(skill => skill.skills.name) || [];

    // Parse education and work experience arrays if they exist
    let education = [];
    let workExperience = [];
    let certificates = [];
    let references = [];

    if (resumeData) {
      const parseJsonArray = (data) => {
        if (!data) return [];
        try {
          return data.map(item => {
            if (typeof item === 'string') {
              return JSON.parse(item);
            }
            return item;
          });
        } catch (error) {
          console.error('Error parsing JSON array:', error);
          return [];
        }
      };

      education = parseJsonArray(resumeData.education);
      workExperience = parseJsonArray(resumeData.work_experience);
      certificates = parseJsonArray(resumeData.certificates);
      references = parseJsonArray(resumeData.reference_list);
    }

    // Create the application data object
    const applicationData = {
      education: assessmentData?.education || '',
      educationDetails: education,
      experience: assessmentData?.experience || '',
      experienceDetails: workExperience,
      technicalSkills,
      softSkills,
      certificates,
      references
    };

    // Use prompt to analyze data
    const prompt = `
      Given the following job application data, analyze and return a score from 0-100 based on education, experience, skills, certifications, and references.
      
      Only return the score for the education, experience, competency (the alignment of technical skills) and personality (the alignment of soft skills). 
      Also return the overall score of each one and provide a 2-3 comment about how each of the data aligns with each other.
      
      Give it to me as a JSON object with the following structure:
      {
        "education": {
          "score": number,
          "comment": string
        },
        "experience": {
          "score": number,
          "comment": string
        },
        "competency": {
          "score": number,
          "comment": string
        },
        "personality": {
          "score": number,
          "comment": string
        },
        "overall": {
          "score": number,
          "comments": string[]
        }
      }
      
      Application data: ${JSON.stringify(applicationData)}
    `;

    // This is sample analysis logic - in a real application you would use an AI model here
    // For now, we'll use a simple algorithm to calculate scores
    const educationScore = assessmentData?.education ? 
      Math.min(70 + (education.length * 10), 100) : 70;
    
    const experienceScore = assessmentData?.experience ? 
      Math.min(65 + (workExperience.length * 10), 100) : 65;
    
    const competencyScore = Math.min(technicalSkills.length * 20, 100);
    
    const personalityScore = Math.min(softSkills.length * 20, 100);
    
    const overallScore = Math.round((educationScore + experienceScore + competencyScore + personalityScore) / 4);

    const analysis = {
      education: {
        score: educationScore,
        comment: "Strong educational background with relevant qualifications."
      },
      experience: {
        score: experienceScore,
        comment: "Good professional experience that aligns with career goals."
      },
      competency: {
        score: competencyScore,
        comment: technicalSkills.length < 3 
          ? "Consider adding more technical skills to your profile." 
          : "Solid technical skill set that meets industry standards."
      },
      personality: {
        score: personalityScore,
        comment: softSkills.length < 3
          ? "Adding more soft skills would strengthen your profile."
          : "Well-rounded soft skills that complement your technical abilities."
      },
      overall: {
        score: overallScore,
        comments: [
          "Strong educational background",
          workExperience.length > 0 ? "Good industry experience" : "Consider adding more work experience",
          technicalSkills.length < 5 ? "Consider adding more technical skills" : "Excellent technical profile"
        ]
      }
    };

    // Store the analysis in Supabase
    const { error: updateError } = await supabase
      .from('seeker_assessments')
      .update({
        analysis_results: analysis
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-application function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
