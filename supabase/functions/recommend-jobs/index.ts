
// recommend-jobs/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

// Initialize OpenRouter API
const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')

// Initialize TheirStack API
const theirStackApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOS0xMjI1NEBsY2N0YW5hdWFuLmVkdS5waCIsInBlcm1pc3Npb25zIjoidXNlciIsImNyZWF0ZWRfYXQiOiIyMDI1LTAzLTAxVDA3OjE2OjAxLjA5NTAzOSswMDowMCJ9.2smpEYSwRVaApYDen8yOA59IKmJn_slwZs7Tmn84yKI'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, try to get data from the resume table (more complete data)
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('education, work_experience, skills')
      .eq('user_id', userId)
      .maybeSingle()

    let userData: any = {}
    let userSkillsData: any[] = []

    // If no resume data, try to get from assessment instead
    if (!resumeData || resumeError) {
      console.log('No resume data found, checking assessment data')
      
      // Get assessment data
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('seeker_assessments')
        .select('education, experience')
        .eq('user_id', userId)
        .maybeSingle()

      if (assessmentError) {
        console.error('Error fetching assessment data:', assessmentError)
        throw new Error('Error fetching assessment data')
      }

      userData = assessmentData || {}
      
      // Get user skills from user_skills table
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skill_type,
          skills (name)
        `)
        .eq('user_id', userId)

      if (skillsError) {
        console.error('Error fetching user skills:', skillsError)
      } else {
        userSkillsData = skillsData || []
      }
    } else {
      // Process resume data
      userData = {
        education: resumeData.education,
        experience: resumeData.work_experience,
        skills: resumeData.skills
      }
    }

    // Prepare data for AI processing
    let formattedSkills: string[] = []
    
    if (userSkillsData.length > 0) {
      // Format skills from user_skills table
      formattedSkills = userSkillsData.map(skill => skill.skills.name)
    } else if (userData.skills) {
      // Format skills from resume
      try {
        const skillsArray = Array.isArray(userData.skills) 
          ? userData.skills 
          : JSON.parse(userData.skills)
        
        formattedSkills = skillsArray.map((skill: any) => {
          if (typeof skill === 'string') {
            try {
              const parsedSkill = JSON.parse(skill)
              return parsedSkill.name
            } catch {
              return skill
            }
          }
          return skill.name
        })
      } catch (e) {
        console.error('Error parsing skills:', e)
      }
    }

    // Format education
    let formattedEducation = ''
    if (userData.education) {
      try {
        const eduArray = Array.isArray(userData.education) 
          ? userData.education 
          : JSON.parse(userData.education)
        
        formattedEducation = eduArray.map((edu: any) => {
          if (typeof edu === 'string') {
            try {
              const parsedEdu = JSON.parse(edu)
              return `${parsedEdu.degree} from ${parsedEdu.school}`
            } catch {
              return edu
            }
          }
          return `${edu.degree} from ${edu.school}`
        }).join(', ')
      } catch (e) {
        console.error('Error parsing education:', e)
        formattedEducation = String(userData.education)
      }
    }

    // Format work experience
    let formattedExperience = ''
    if (userData.experience) {
      formattedExperience = userData.experience
    } else if (userData.work_experience) {
      try {
        const expArray = Array.isArray(userData.work_experience) 
          ? userData.work_experience 
          : JSON.parse(userData.work_experience)
        
        formattedExperience = expArray.map((exp: any) => {
          if (typeof exp === 'string') {
            try {
              const parsedExp = JSON.parse(exp)
              return `${parsedExp.title} at ${parsedExp.company}: ${parsedExp.description}`
            } catch {
              return exp
            }
          }
          return `${exp.title} at ${exp.company}: ${exp.description}`
        }).join('\n')
      } catch (e) {
        console.error('Error parsing work experience:', e)
        formattedExperience = String(userData.work_experience)
      }
    }

    // Generate job titles using AI
    console.log('Generating job title suggestions with AI')
    const aiPrompt = `
Based on the following profile, suggest 5-7 job titles that would be a good fit:

Education: ${formattedEducation || 'Not specified'}
Experience: ${formattedExperience || 'Not specified'}
Skills: ${formattedSkills.join(', ') || 'Not specified'}

Return ONLY an array of job titles in JSON format, like this: ["Job Title 1", "Job Title 2", "Job Title 3"]
No explanation, ONLY the JSON array.
`

    let suggestedJobTitles: string[] = []
    try {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterApiKey}`,
          'HTTP-Referer': 'https://lovable.ai'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-coder-v2',
          messages: [
            { role: 'system', content: 'You are a job recommendation assistant. Only respond with the exact JSON format requested, nothing more.' },
            { role: 'user', content: aiPrompt }
          ],
          max_tokens: 300
        }),
      })

      const aiData = await aiResponse.json()
      
      if (aiData.choices && aiData.choices[0]?.message?.content) {
        const content = aiData.choices[0].message.content.trim()
        
        // Try to extract JSON array from the response
        let jsonMatch = content.match(/\[.*\]/s)
        if (jsonMatch) {
          try {
            suggestedJobTitles = JSON.parse(jsonMatch[0])
          } catch (e) {
            console.error('Error parsing AI response JSON:', e)
          }
        }
        
        // If that failed, try to parse the entire content as JSON
        if (suggestedJobTitles.length === 0) {
          try {
            suggestedJobTitles = JSON.parse(content)
          } catch (e) {
            console.error('Error parsing AI response as JSON:', e)
          }
        }
      }
      
      // Fallback if parsing failed
      if (!Array.isArray(suggestedJobTitles) || suggestedJobTitles.length === 0) {
        suggestedJobTitles = ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"]
      }
      
      console.log('AI suggested job titles:', suggestedJobTitles)
    } catch (error) {
      console.error('Error calling AI API:', error)
      // Fallback job titles
      suggestedJobTitles = ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"]
    }

    // Calculate date for filtering recent jobs (15 days ago)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const dateFilter = fifteenDaysAgo.toISOString().split('T')[0] // Format as YYYY-MM-DD

    // Fetch job listings from TheirStack API
    console.log('Fetching job listings from TheirStack API')
    const jobs = []
    
    // Use first 3 job titles for API requests to avoid rate limiting
    const titlesToSearch = suggestedJobTitles.slice(0, 3)
    
    for (const jobTitle of titlesToSearch) {
      try {
        const apiUrl = new URL('https://api.theirstack.guru/v1/job-postings')
        apiUrl.searchParams.append('search', jobTitle)
        apiUrl.searchParams.append('from', dateFilter)
        
        const response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${theirStackApiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`TheirStack API returned ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        
        if (data && Array.isArray(data.data)) {
          // Transform job data to our format and add match reason
          const transformedJobs = data.data.map((job: any) => ({
            title: job.title || 'Unknown Title',
            company: job.company_name || 'Unknown Company',
            location: job.location || 'Remote',
            description: job.description || 'No description available',
            postedAt: job.posted_at || new Date().toISOString(),
            platform: job.source || 'theirstack',
            url: job.url || '#',
            reason: `Matched with your profile for "${jobTitle}"`
          }))
          
          jobs.push(...transformedJobs)
        }
      } catch (error) {
        console.error(`Error fetching jobs for "${jobTitle}":`, error)
      }
    }

    // Limit to max 9 jobs and deduplicate by URL
    const uniqueJobs = Array.from(
      new Map(jobs.map(job => [job.url, job])).values()
    ).slice(0, 9)

    console.log(`Returning ${uniqueJobs.length} job recommendations`)
    
    return new Response(
      JSON.stringify({ 
        jobs: uniqueJobs,
        jobTitles: suggestedJobTitles 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in recommend-jobs function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

