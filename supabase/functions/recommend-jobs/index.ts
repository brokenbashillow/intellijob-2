
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Constants for job search
const MAX_JOBS_PER_TITLE = 3;
const DAYS_BACK = 30;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('userId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate API key
    const theirStackApiKey = Deno.env.get('THEIRSTACK_API_KEY');
    if (!theirStackApiKey) {
      console.error('TheirStack API key is not set');
      throw new Error('TheirStack API key is not configured');
    }

    // Get assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('seeker_assessments')
      .select(`
        *,
        user_skills(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError);
      throw new Error(`Error fetching assessment: ${assessmentError.message}`);
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error(`Error fetching profile: ${profileError.message}`);
    }

    // Generate job titles
    let jobTitles: string[] = [];
    if (assessment?.job_title) {
      jobTitles.push(assessment.job_title);
    }

    if (assessment?.user_skills) {
      const skills = assessment.user_skills
        .filter((skill: any) => skill.skill_type === 'technical')
        .map((skill: any) => skill.skill_id);
      
      if (skills.length > 0) {
        // Get skill names
        const { data: skillData, error: skillError } = await supabase
          .from('skills')
          .select('name')
          .in('id', skills);
        
        if (skillError) {
          console.error('Error fetching skills:', skillError);
        } else if (skillData && skillData.length > 0) {
          // Add common job titles based on skills
          const techSkills = skillData.map((s: any) => s.name);
          
          if (techSkills.some(s => /react|vue|angular|javascript|typescript/i.test(s))) {
            jobTitles.push('Frontend Developer');
          }
          if (techSkills.some(s => /node|express|django|flask|php|java|spring|api/i.test(s))) {
            jobTitles.push('Backend Developer');
          }
          if (techSkills.some(s => /react|vue|angular|node|express/i.test(s))) {
            jobTitles.push('Full Stack Developer');
          }
          if (techSkills.some(s => /python|data|analytics|sql|machine learning|ml|ai/i.test(s))) {
            jobTitles.push('Data Scientist');
          }
          if (techSkills.some(s => /ui|ux|figma|sketch|design/i.test(s))) {
            jobTitles.push('UX Designer');
          }
        }
      }
    }

    // Ensure we have at least some job titles
    if (jobTitles.length === 0) {
      jobTitles = ['Software Developer', 'Web Developer', 'Frontend Developer'];
    }

    // Deduplicate job titles
    jobTitles = [...new Set(jobTitles)];
    
    // Limit to 3 job titles
    if (jobTitles.length > 3) {
      jobTitles = jobTitles.slice(0, 3);
    }

    console.log('Generated job titles:', jobTitles);

    // Fetch jobs for each title
    const jobs = [];
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - DAYS_BACK);
    const dateFilterStr = dateFilter.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    for (const jobTitle of jobTitles) {
      try {
        console.log(`Searching for jobs with title: ${jobTitle}`);
        
        // Correct API URL for TheirStack
        const apiUrl = 'https://api.theirstack.guru/v1/jobs/search';
        
        // Prepare the request body according to TheirStack API docs
        const requestBody = {
          job_title_or: [jobTitle],
          posted_at_gte: dateFilterStr,
          limit: MAX_JOBS_PER_TITLE
        };
        
        console.log(`API URL: ${apiUrl}`);
        console.log(`Request Body: ${JSON.stringify(requestBody)}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST', // Use POST method as required by TheirStack
          headers: {
            'Authorization': `Bearer ${theirStackApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`TheirStack API error (${response.status}): ${errorBody}`);
          throw new Error(`TheirStack API returned ${response.status}: ${errorBody}`);
        }
        
        const data = await response.json();
        console.log(`Got ${data.data?.length || 0} jobs for "${jobTitle}"`);
        
        if (data && Array.isArray(data.data)) {
          const transformedJobs = data.data.map((job: any) => ({
            title: job.job_title || 'Unknown Title',
            company: job.company || 'Unknown Company',
            location: job.location || 'Remote',
            description: job.description || 'No description available',
            postedAt: job.date_posted || new Date().toISOString(),
            platform: job.source || 'TheirStack',
            url: job.url || '#',
            reason: `Matched with your profile for "${jobTitle}"`,
          }));
          
          jobs.push(...transformedJobs);
        }
      } catch (error) {
        console.error(`Error fetching jobs for "${jobTitle}":`, error);
      }
    }
    
    // Sort jobs by posted date (newest first)
    jobs.sort((a: any, b: any) => {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
    
    console.log(`Returning ${jobs.length} job recommendations`);
    
    // If no jobs found, return fallback examples
    if (jobs.length === 0) {
      return new Response(JSON.stringify({
        jobs: [
          { 
            title: "Frontend Developer", 
            company: "Tech Solutions Inc",
            location: "San Francisco, CA", 
            description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
            postedAt: new Date().toISOString(), 
            platform: "Example",
            url: "#"
          },
          { 
            title: "UX/UI Designer", 
            company: "Creative Studio",
            location: "New York, NY", 
            description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
            postedAt: new Date().toISOString(), 
            platform: "Example",
            url: "#"
          },
          { 
            title: "Full Stack Engineer", 
            company: "InnovateApp",
            location: "Remote", 
            description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
            postedAt: new Date().toISOString(), 
            platform: "Example",
            url: "#"
          },
        ],
        jobTitles,
        error: "No live job listings found matching your profile"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      jobs,
      jobTitles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in recommend-jobs function:', error);
    
    // Return error with fallback data
    return new Response(JSON.stringify({
      jobs: [
        { 
          title: "Frontend Developer", 
          company: "Tech Solutions Inc",
          location: "San Francisco, CA", 
          description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#"
        },
        { 
          title: "UX/UI Designer", 
          company: "Creative Studio",
          location: "New York, NY", 
          description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#"
        },
        { 
          title: "Full Stack Engineer", 
          company: "InnovateApp",
          location: "Remote", 
          description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#"
        },
      ],
      jobTitles: ['Software Developer', 'Web Developer', 'Frontend Developer'],
      error: `Error: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // Return 200 even on error to avoid client crashes, with error in the payload
    });
  }
});
