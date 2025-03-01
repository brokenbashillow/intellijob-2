
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';

// Mock TheirStack API function - replace with actual API integration
async function fetchJobListings() {
  // In a real implementation, this would call TheirStack API
  // For now, returning mock data
  return [
    { 
      title: "Frontend Developer", 
      company: "Tech Solutions Inc",
      location: "San Francisco, CA", 
      description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
      postedAt: "2023-05-15", 
      platform: "jobstreet",
      url: "https://example.com/job1"
    },
    { 
      title: "UX/UI Designer", 
      company: "Creative Studio",
      location: "New York, NY", 
      description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
      postedAt: "2023-05-16", 
      platform: "indeed",
      url: "https://example.com/job2"
    },
    { 
      title: "Full Stack Developer", 
      company: "InnovateApp",
      location: "Remote", 
      description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
      postedAt: "2023-05-17", 
      platform: "linkedin",
      url: "https://example.com/job3"
    },
    { 
      title: "Software Engineer", 
      company: "TechGiant",
      location: "Seattle, WA", 
      description: "Looking for a software engineer to help build scalable and reliable systems using modern technologies.",
      postedAt: "2023-05-17", 
      platform: "linkedin",
      url: "https://example.com/job4"
    },
    { 
      title: "Data Scientist", 
      company: "DataCorp",
      location: "Boston, MA", 
      description: "Join our team to analyze large datasets and build machine learning models to solve complex problems.",
      postedAt: "2023-05-18", 
      platform: "indeed",
      url: "https://example.com/job5"
    },
    { 
      title: "DevOps Engineer", 
      company: "CloudSys",
      location: "Remote", 
      description: "Looking for a DevOps engineer to help automate and optimize our infrastructure and deployment processes.",
      postedAt: "2023-05-19", 
      platform: "jobstreet",
      url: "https://example.com/job6"
    },
    { 
      title: "Product Manager", 
      company: "ProductLabs",
      location: "Austin, TX", 
      description: "Join our team to lead the development of innovative products from conception to launch.",
      postedAt: "2023-05-20", 
      platform: "linkedin",
      url: "https://example.com/job7"
    }
  ];
}

async function rankJobsWithAI(userProfile: any, jobs: any[]) {
  console.log("Ranking jobs with AI for user:", userProfile.id);
  
  try {
    // Create a prompt that describes the user's skills and the available jobs
    let prompt = `Given a job seeker with the following profile:\n\n`;
    
    // Add technical skills
    prompt += `Technical Skills: ${userProfile.technical_skills.map((skill: any) => skill.name).join(", ")}\n`;
    
    // Add soft skills
    prompt += `Soft Skills: ${userProfile.soft_skills.map((skill: any) => skill.name).join(", ")}\n`;
    
    // Add education and experience
    prompt += `Education: ${userProfile.education}\n`;
    prompt += `Experience: ${userProfile.experience}\n\n`;
    
    // Add jobs to evaluate
    prompt += `Available Jobs:\n`;
    jobs.forEach((job, index) => {
      prompt += `Job ${index + 1}: ${job.title} at ${job.company}\n`;
      prompt += `Description: ${job.description}\n`;
      prompt += `Location: ${job.location}\n\n`;
    });
    
    prompt += `Please analyze these jobs and recommend the top 3 that best match the job seeker's profile. For each job, provide a score from 1-100 and a brief explanation of why it's a good match. Return your response as a JSON array with this format:
    [
      {
        "jobIndex": 0, // The index of the job in the list (starting from 0)
        "score": 95, // Match score from 1-100
        "reason": "This job is a great match because..." // Brief explanation
      }
    ]`;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Job Recommendation System'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response:", data);
      throw new Error("Invalid response from OpenRouter API");
    }
    
    const content = data.choices[0].message.content;
    let recommendations;
    
    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      recommendations = Array.isArray(parsedContent) ? parsedContent : parsedContent.recommendations || [];
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw AI response:", content);
      throw new Error("Failed to parse AI recommendations");
    }
    
    // Map the recommendations to the actual job objects
    return recommendations.slice(0, 3).map((rec: any) => {
      const job = jobs[rec.jobIndex];
      return {
        ...job,
        score: rec.score,
        reason: rec.reason
      };
    });
  } catch (error) {
    console.error("Error in rankJobsWithAI:", error);
    // Return the first 3 jobs if AI ranking fails
    return jobs.slice(0, 3);
  }
}

async function getUserSkills(supabase: any, userId: string) {
  // Get technical skills
  const { data: technicalSkills, error: technicalError } = await supabase
    .from('user_skills')
    .select(`
      skill_id,
      skills (
        id,
        name,
        category_id
      )
    `)
    .eq('user_id', userId)
    .eq('skill_type', 'technical');
  
  if (technicalError) {
    console.error('Error fetching technical skills:', technicalError);
    return { technical_skills: [], soft_skills: [] };
  }
  
  // Get soft skills
  const { data: softSkills, error: softError } = await supabase
    .from('user_skills')
    .select(`
      skill_id,
      skills (
        id,
        name,
        category_id
      )
    `)
    .eq('user_id', userId)
    .eq('skill_type', 'soft');
  
  if (softError) {
    console.error('Error fetching soft skills:', softError);
    return { technical_skills: technicalSkills || [], soft_skills: [] };
  }
  
  return {
    technical_skills: technicalSkills?.map((item: any) => item.skills) || [],
    soft_skills: softSkills?.map((item: any) => item.skills) || []
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get user ID from request
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('seeker_assessments')
      .select('education, experience, location')
      .eq('user_id', userId)
      .single();
    
    if (assessmentError) {
      console.error('Error fetching assessment data:', assessmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user assessment data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user skills
    const userSkills = await getUserSkills(supabase, userId);
    
    // Combine all user data
    const userProfile = {
      id: userId,
      ...assessmentData,
      ...userSkills
    };
    
    // Fetch job listings
    const jobListings = await fetchJobListings();
    
    // Rank jobs using AI
    const recommendedJobs = await rankJobsWithAI(userProfile, jobListings);
    
    return new Response(
      JSON.stringify({ jobs: recommendedJobs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in recommend-jobs function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
