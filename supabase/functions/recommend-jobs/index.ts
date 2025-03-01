
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  education: string[];
  workExperience: string[];
  skills: string[];
  certificates: string[];
}

interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  postedAt: string;
  platform: string;
  url: string;
  score?: number;
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || '';
    const theirStackApiKey = Deno.env.get('THEIRSTACK_API_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOS0xMjI1NEBsY2N0YW5hdWFuLmVkdS5waCIsInBlcm1pc3Npb25zIjoidXNlciIsImNyZWF0ZWRfYXQiOiIyMDI1LTAzLTAxVDA3OjE2OjAxLjA5NTAzOSswMDowMCJ9.2smpEYSwRVaApYDen8yOA59IKmJn_slwZs7Tmn84yKI';

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Fetching user data for userId:", userId);
    
    // First try to get resume data
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Initialize userData with default empty arrays
    let userData: UserData = {
      education: [],
      workExperience: [],
      skills: [],
      certificates: [],
    };
    
    // If resume exists, use resume data
    if (resumeData) {
      console.log("Found resume data");
      
      // Parse education
      const education = resumeData.education?.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          return `${parsed.degree} at ${parsed.school}`;
        } catch (e) {
          return String(item);
        }
      }) || [];
      
      // Parse work experience
      const workExperience = resumeData.work_experience?.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          return `${parsed.title} at ${parsed.company}: ${parsed.description}`;
        } catch (e) {
          return String(item);
        }
      }) || [];
      
      // Parse skills
      const skills = resumeData.skills?.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          return parsed.name;
        } catch (e) {
          return String(item);
        }
      }) || [];
      
      // Parse certificates
      const certificates = resumeData.certificates?.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          return `${parsed.name} from ${parsed.organization}`;
        } catch (e) {
          return String(item);
        }
      }) || [];
      
      userData = {
        education,
        workExperience,
        skills,
        certificates
      };
    } else {
      console.log("No resume found, checking assessment data");
      
      // Fallback to assessment data
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('seeker_assessments')
        .select('education, experience')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (assessmentData) {
        console.log("Found assessment data");
        
        // Get skills from user_skills table
        const { data: userSkillsData, error: userSkillsError } = await supabase
          .from('user_skills')
          .select(`
            skill_id,
            skill_type,
            skills (name)
          `)
          .eq('user_id', userId);
        
        userData = {
          education: [assessmentData.education],
          workExperience: [assessmentData.experience],
          skills: userSkillsData?.map(skillData => skillData.skills.name) || [],
          certificates: []
        };
      } else {
        console.log("No assessment data found either");
        return new Response(
          JSON.stringify({ 
            error: "No user data found",
            jobs: [] 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    console.log("User data collected:", JSON.stringify(userData));
    
    // Generate job titles using OpenRouter
    console.log("Generating job titles with AI...");
    const prompt = `
Based on the following user profile, suggest 5 job titles that would be a good match. Return ONLY a JSON array of strings without any explanation.

Education: ${userData.education.join(', ')}
Work Experience: ${userData.workExperience.join(', ')}
Skills: ${userData.skills.join(', ')}
${userData.certificates.length > 0 ? `Certificates: ${userData.certificates.join(', ')}` : ''}
`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": "https://lovable.ai",
        "X-Title": "TheirStack Job Recommender"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-coder-v2-instruct",
        messages: [
          { role: "system", content: "You are a job recommendation assistant. Respond only with a JSON array of job title strings that match the user's profile." },
          { role: "user", content: prompt }
        ]
      })
    });

    let jobTitles: string[] = [];
    try {
      const aiResponse = await openRouterResponse.json();
      console.log("AI Response:", JSON.stringify(aiResponse));
      
      // Extract job titles from AI response
      const content = aiResponse.choices?.[0]?.message?.content || "";
      const extractedJson = content.match(/\[.*\]/s)?.[0] || "";
      
      try {
        // Try to parse the JSON array directly
        jobTitles = JSON.parse(extractedJson);
      } catch (e) {
        // If that fails, try parsing after cleaning up the string
        const cleanedJson = content
          .replace(/^```json/m, '')
          .replace(/```$/m, '')
          .trim();
        jobTitles = JSON.parse(cleanedJson);
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      jobTitles = userData.skills.length > 0 
        ? [`${userData.skills[0]} Specialist`, `${userData.skills[0]} Developer`]
        : ["Software Developer", "Web Developer", "Data Analyst", "Project Manager", "UX Designer"];
    }
    
    console.log("Generated job titles:", jobTitles);

    // Fetch job listings from TheirStack
    console.log("Fetching job listings from TheirStack...");
    const jobTitleParams = jobTitles.map(title => encodeURIComponent(title)).join('&job_title_or=');
    const theirStackUrl = `https://api.theirstack.com/v1/jobs/search?posted_at_max_age_days=15&${jobTitleParams}&limit=10`;
    
    const jobListingsResponse = await fetch(theirStackUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${theirStackApiKey}`,
      }
    });
    
    if (!jobListingsResponse.ok) {
      console.error("TheirStack API error:", await jobListingsResponse.text());
      throw new Error("Failed to fetch job listings");
    }
    
    const jobListingsData = await jobListingsResponse.json();
    console.log(`Fetched ${jobListingsData.total_count} job listings`);
    
    // Transform the job listings to our format
    const formattedJobs: Job[] = jobListingsData.jobs.map((job: any) => ({
      title: job.title,
      company: job.company_name,
      location: job.location || "Remote",
      description: job.description || "",
      postedAt: job.date_posted,
      platform: job.source || "TheirStack",
      url: job.apply_url || job.url || "#",
      // We'll calculate these later
      score: null,
      reason: null
    }));

    // Return the processed job listings
    console.log(`Returning ${formattedJobs.length} job recommendations`);
    
    return new Response(
      JSON.stringify({ 
        jobs: formattedJobs.slice(0, 6) // Limit to top 6 results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in recommend-jobs function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
