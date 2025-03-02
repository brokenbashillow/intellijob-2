
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const THEIRSTACK_API_KEY = Deno.env.get('THEIRSTACK_API_KEY')

// Serverless function to recommend jobs based on user profile data
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Parse request body
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client with service role for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Check if TheirStack API key is available
    if (!THEIRSTACK_API_KEY) {
      console.error('THEIRSTACK_API_KEY is not set in environment variables')
      throw new Error('TheirStack API key not configured')
    }
    
    // Fetch user assessment data and skills
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('seeker_assessments')
      .select(`
        *,
        user_skills(*)
      `)
      .eq('user_id', userId)
      .maybeSingle()
      
    if (assessmentError) {
      console.error('Error fetching assessment data:', assessmentError)
      throw assessmentError
    }
    
    // Fetch user resume data
    const { data: resumeData, error: resumeError } = await supabase
      .from('resume_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      
    if (resumeError) {
      console.error('Error fetching resume data:', resumeError)
      throw resumeError
    }
    
    console.log(`Got assessment data for user ${userId}:`, !!assessmentData)
    console.log(`Got resume data for user ${userId}:`, !!resumeData)
    
    // Extract relevant job skills and interests
    let jobTitles = []
    let jobs = []
    let apiError = null
    
    if (assessmentData && assessmentData.user_skills && assessmentData.user_skills.length > 0) {
      // Extract top skills from user skills
      const userSkills = assessmentData.user_skills
        .filter((skill: any) => skill.proficiency_level >= 3)
        .map((skill: any) => skill.skill_name)
      
      // Use skills to determine potential job titles
      if (userSkills.includes('React') || userSkills.includes('JavaScript')) {
        jobTitles.push('Frontend Developer', 'React Developer', 'JavaScript Developer')
      }
      
      if (userSkills.includes('Node.js') || userSkills.includes('Express')) {
        jobTitles.push('Backend Developer', 'Node.js Developer', 'Full Stack Developer')
      }
      
      if (userSkills.includes('Python') || userSkills.includes('Django') || userSkills.includes('Flask')) {
        jobTitles.push('Python Developer', 'Backend Developer')
      }
      
      if (userSkills.includes('UI/UX') || userSkills.includes('Figma') || userSkills.includes('Design')) {
        jobTitles.push('UI/UX Designer', 'Product Designer')
      }
      
      if (resumeData && resumeData.personal_details && resumeData.personal_details.jobTitle) {
        jobTitles.unshift(resumeData.personal_details.jobTitle)
      }
      
      // Remove duplicates and limit to top 5
      jobTitles = [...new Set(jobTitles)].slice(0, 5)
    } else {
      // Fallback job titles if no assessment data
      jobTitles = ['Software Developer', 'Frontend Developer', 'Backend Developer']
    }
    
    console.log('Job titles for search:', jobTitles)
    
    try {
      // Get jobs for each job title using TheirStack API with proper POST endpoint
      for (const jobTitle of jobTitles.slice(0, 3)) { // Limit API calls to top 3 job titles
        try {
          console.log(`Searching for jobs with title: ${jobTitle}`)
          
          // Calculate date for filtering (last 90 days)
          const date = new Date()
          date.setDate(date.getDate() - 90)
          const dateFilter = date.toISOString().split('T')[0] // Format: YYYY-MM-DD
          
          // Correct API URL and method according to documentation
          const apiUrl = 'https://api.theirstack.guru/v1/jobs/search'
          
          // Prepare the request body
          const requestBody = {
            job_title_or: [jobTitle],
            posted_at_gte: dateFilter,
            limit: 10 // Limit results per job title
          }
          
          console.log(`API URL: ${apiUrl}`)
          console.log(`Request Body: ${JSON.stringify(requestBody)}`)
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${THEIRSTACK_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })
          
          console.log(`Response status: ${response.status}`)
          
          if (!response.ok) {
            const errorBody = await response.text()
            console.error(`TheirStack API error (${response.status}): ${errorBody}`)
            throw new Error(`TheirStack API returned ${response.status}: ${errorBody}`)
          }
          
          const data = await response.json()
          console.log(`Got ${data.data?.length || 0} jobs for "${jobTitle}"`)
          
          if (data && Array.isArray(data.data)) {
            const transformedJobs = data.data.map((job: any) => ({
              title: job.job_title || 'Unknown Title',
              company: job.company || 'Unknown Company',
              location: job.location || 'Remote',
              description: job.description || 'No description available',
              postedAt: job.date_posted || new Date().toISOString(),
              platform: job.source || 'TheirStack',
              url: job.url || '#',
              reason: `Matched with your profile for "${jobTitle}"`
            }))
            
            jobs.push(...transformedJobs)
          }
        } catch (error) {
          console.error(`Error fetching jobs for "${jobTitle}":`, error)
          console.error('Full error details:', JSON.stringify(error, null, 2))
        }
      }
    } catch (error) {
      console.error('Error fetching jobs from TheirStack API:', error)
      apiError = `Error fetching job data: ${error.message}`
      
      // Continue execution to provide fallback jobs
    }
    
    // Add fallback example jobs if no jobs were found via API
    if (jobs.length === 0) {
      console.log('No jobs found via API, adding fallback jobs')
      
      jobs = [
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
      ]
    }
    
    return new Response(
      JSON.stringify({ jobs, jobTitles, error: apiError }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in recommend-jobs function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: `Error processing job recommendations: ${error.message}`,
        jobs: [
          { 
            title: "Frontend Developer", 
            company: "Tech Solutions Inc",
            location: "San Francisco, CA", 
            description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
            postedAt: new Date().toISOString(), 
            platform: "fallback",
            url: "#"
          },
          { 
            title: "UX/UI Designer", 
            company: "Creative Studio",
            location: "New York, NY", 
            description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
            postedAt: new Date().toISOString(), 
            platform: "fallback",
            url: "#"
          },
          { 
            title: "Full Stack Engineer", 
            company: "InnovateApp",
            location: "Remote", 
            description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
            postedAt: new Date().toISOString(), 
            platform: "fallback",
            url: "#"
          },
        ],
        jobTitles: ["Software Developer", "Web Developer", "Frontend Developer"]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
