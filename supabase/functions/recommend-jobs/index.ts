
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get environment variables
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;
    const theirStackApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOS0xMjI1NEBsY2N0YW5hdWFuLmVkdS5waCIsInBlcm1pc3Npb25zIjoidXNlciIsImNyZWF0ZWRfYXQiOiIyMDI1LTAzLTAxVDA3OjE2OjAxLjA5NTAzOSswMDowMCJ9.2smpEYSwRVaApYDen8yOA59IKmJn_slwZs7Tmn84yKI';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    console.log(`Processing job recommendations for user: ${userId}`);
    
    // Get user data from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      throw profileError;
    }
    
    // Get assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('seeker_assessments')
      .select(`
        *,
        user_skills(
          *,
          skills(name)
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (assessmentError) {
      console.error("Error fetching assessment data:", assessmentError);
      throw assessmentError;
    }
    
    // Get resume data if it exists
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (resumeError && resumeError.code !== 'PGRST116') {
      console.error("Error fetching resume data:", resumeError);
      throw resumeError;
    }
    
    // Prepare user data for AI analysis
    let userData = {
      education: '',
      experience: '',
      technicalSkills: [],
      softSkills: [],
      certificates: [],
    };
    
    // Populate with assessment data
    if (assessmentData) {
      userData.education = assessmentData.education || '';
      userData.experience = assessmentData.experience || '';
      
      // Extract skills from assessment
      if (assessmentData.user_skills && assessmentData.user_skills.length > 0) {
        assessmentData.user_skills.forEach(skill => {
          if (skill.skill_type === 'technical') {
            userData.technicalSkills.push(skill.skills.name);
          } else if (skill.skill_type === 'soft') {
            userData.softSkills.push(skill.skills.name);
          }
        });
      }
    }
    
    // Override with resume data if available
    if (resumeData) {
      // Parse education from resume
      if (resumeData.education && resumeData.education.length > 0) {
        try {
          const education = resumeData.education.map(edu => {
            if (typeof edu === 'string') {
              return JSON.parse(edu);
            }
            return edu;
          });
          
          userData.education = education.map(edu => 
            `${edu.degree} from ${edu.school}`
          ).join(", ");
        } catch (e) {
          console.error("Error parsing education:", e);
        }
      }
      
      // Parse work experience from resume
      if (resumeData.work_experience && resumeData.work_experience.length > 0) {
        try {
          const experience = resumeData.work_experience.map(exp => {
            if (typeof exp === 'string') {
              return JSON.parse(exp);
            }
            return exp;
          });
          
          userData.experience = experience.map(exp => 
            `${exp.title} at ${exp.company}: ${exp.description}`
          ).join(". ");
        } catch (e) {
          console.error("Error parsing work experience:", e);
        }
      }
      
      // Parse certificates from resume
      if (resumeData.certificates && resumeData.certificates.length > 0) {
        try {
          const certificates = resumeData.certificates.map(cert => {
            if (typeof cert === 'string') {
              return JSON.parse(cert);
            }
            return cert;
          });
          
          userData.certificates = certificates.map(cert => 
            `${cert.name} from ${cert.organization}`
          );
        } catch (e) {
          console.error("Error parsing certificates:", e);
        }
      }
      
      // Parse skills from resume
      if (resumeData.skills && resumeData.skills.length > 0) {
        try {
          const skills = resumeData.skills.map(skill => {
            if (typeof skill === 'string') {
              return JSON.parse(skill);
            }
            return skill;
          });
          
          userData.technicalSkills = skills
            .filter(skill => skill.type === 'technical')
            .map(skill => skill.name);
          
          userData.softSkills = skills
            .filter(skill => skill.type === 'soft')
            .map(skill => skill.name);
        } catch (e) {
          console.error("Error parsing skills:", e);
        }
      }
    }
    
    console.log("Prepared user data for AI analysis:", JSON.stringify(userData));
    
    // Generate job titles using OpenRouter with DeepSeek R1 Distill Llama
    const prompt = `
Based on the following candidate information, generate an array of 5 job titles that would be most relevant for this person. 
Return ONLY a valid JSON array of strings without any explanation or additional text.

Candidate Information:
- Education: ${userData.education}
- Work Experience: ${userData.experience}
- Technical Skills: ${userData.technicalSkills.join(', ')}
- Soft Skills: ${userData.softSkills.join(', ')}
- Certificates: ${userData.certificates.join(', ')}
`;

    console.log("Sending prompt to OpenRouter:", prompt);
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'Job Recommendation System'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-llm-7b-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });
    
    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error(`OpenRouter API error: ${errorText}`);
    }
    
    const openRouterData = await openRouterResponse.json();
    console.log("OpenRouter response:", JSON.stringify(openRouterData));
    
    let jobTitles = [];
    try {
      // Extract just the array from the response
      const content = openRouterData.choices[0].message.content;
      // Clean the content (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      jobTitles = JSON.parse(cleanedContent);
      console.log("Parsed job titles:", jobTitles);
    } catch (error) {
      console.error("Error parsing job titles from AI response:", error);
      // Fallback to a simple extraction if parsing fails
      try {
        const content = openRouterData.choices[0].message.content;
        const matches = content.match(/\[(.*)\]/s);
        if (matches && matches[1]) {
          // Try to parse with quotes added
          jobTitles = JSON.parse(`[${matches[1].split(',').map(title => `"${title.trim().replace(/"/g, '\\"')}"`).join(',')}]`);
        } else {
          // Just extract any strings that look like job titles
          jobTitles = content
            .split(/\n|,/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.includes('[') && !line.includes(']'));
        }
        console.log("Extracted job titles using fallback method:", jobTitles);
      } catch (e) {
        console.error("Fallback extraction also failed:", e);
        jobTitles = ["Software Engineer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"];
      }
    }
    
    if (!Array.isArray(jobTitles) || jobTitles.length === 0) {
      console.warn("No valid job titles returned, using default titles");
      jobTitles = ["Software Engineer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"];
    }
    
    // Calculate date 15 days ago
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const dateFilter = fifteenDaysAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    console.log(`Fetching jobs posted since: ${dateFilter}`);
    
    // Prepare job title queries
    const jobQueries = jobTitles.map(title => {
      // Query TheirStack API for each job title
      return fetch(`https://theirstack.com/api/jobs/?title=${encodeURIComponent(title)}&date_after=${dateFilter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${theirStackApiKey}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`TheirStack API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`Found ${data.results.length} jobs for title: ${title}`);
        return data.results.map(job => ({
          ...job,
          matchedTitle: title // Track which title matched this job
        }));
      })
      .catch(error => {
        console.error(`Error fetching jobs for title ${title}:`, error);
        return [];
      });
    });
    
    // Wait for all job queries to complete
    const jobResults = await Promise.all(jobQueries);
    
    // Flatten and process results
    let allJobs = jobResults.flat();
    
    // Remove duplicates based on job ID
    const uniqueJobs = [...new Map(allJobs.map(job => [job.id, job])).values()];
    
    // Format jobs for the frontend
    const formattedJobs = uniqueJobs.map(job => ({
      title: job.title,
      company: job.company.name,
      location: job.location || "Remote",
      description: job.description.slice(0, 200) + (job.description.length > 200 ? '...' : ''),
      postedAt: job.created_at,
      platform: job.source,
      url: job.url,
      reason: `Matched with your profile based on ${job.matchedTitle} experience`
    }));
    
    // Take only the top 6 jobs
    const topJobs = formattedJobs.slice(0, 6);
    
    console.log(`Returning ${topJobs.length} recommended jobs`);
    
    return new Response(
      JSON.stringify({ 
        jobs: topJobs,
        jobTitles: jobTitles 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in recommend-jobs function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        jobs: [] 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
