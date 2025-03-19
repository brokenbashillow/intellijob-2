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
    const { userId, isEmployer = false } = await req.json();
    
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
    
    // If no jobs found and not an employer account, return fallback examples by category
    if (jobs.length === 0 && !isEmployer) {
      // Define fallback jobs based on education
      let fallbackJobs = [];
      let primaryCategory = "";
      let secondaryCategory = "";
      
      if (assessment?.education) {
        const educationDegrees = assessment.education || [];
        const degrees = educationDegrees
          .map((edu: any) => edu.degree?.toLowerCase() || '')
          .filter(Boolean);
        
        // Check if user has healthcare/medical/nursing education
        const hasMedicalEducation = degrees.some((degree: string) => 
          /nursing|healthcare|medical|health|medicine|pharma|dental|therapist/i.test(degree)
        );
        
        // Check if user has business/finance education
        const hasBusinessEducation = degrees.some((degree: string) => 
          /business|finance|accounting|marketing|management|mba|economics|commerce/i.test(degree)
        );
        
        // Check if user has tech/IT education
        const hasTechEducation = degrees.some((degree: string) => 
          /computer|software|IT|information technology|programming|engineering|data science|technical/i.test(degree)
        );
        
        // Check if user has law education
        const hasLawEducation = degrees.some((degree: string) => 
          /law|legal|juris|political science|government|policy/i.test(degree)
        );
        
        // Check if user has engineering education
        const hasEngineeringEducation = degrees.some((degree: string) => 
          /engineering|mechanical|electrical|civil|chemical|industrial/i.test(degree)
        );

        if (hasMedicalEducation) {
          primaryCategory = "Health and Medicine";
          secondaryCategory = "Business and Finance";
          
          // Health and Medicine category
          fallbackJobs = [
            { 
              id: "health-1",
              title: "Registered Nurse", 
              company: "St. Luke's Medical Center",
              location: "Quezon City, Philippines", 
              description: "Join our nursing team to provide high-quality patient care. We're seeking licensed RNs with excellent communication skills and a compassionate approach to healthcare.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare",
              reason: "Matches your nursing education",
              salary: "PHP 35,000–45,000/month",
              requirements: "Proficient in patient care and assessment, experience in venipuncture and catheterization, strong knowledge of medical terminology, ability to respond effectively to emergencies"
            },
            { 
              id: "health-2",
              title: "Medical Laboratory Technician", 
              company: "Philippine General Hospital",
              location: "Manila, Philippines", 
              description: "Perform laboratory tests and procedures to assist in the diagnosis, treatment, and prevention of disease. Work with sophisticated lab equipment to analyze samples.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare",
              reason: "Related to your healthcare background",
              salary: "PHP 28,000–35,000/month",
              requirements: "Experience with laboratory testing and analysis, understanding of pharmacology and drug administration, ability to handle diagnostic imaging equipment"
            },
            { 
              id: "health-3",
              title: "Physical Therapist", 
              company: "MediRehab Center",
              location: "Cebu City, Philippines", 
              description: "Help patients improve their mobility and manage pain through therapeutic exercises and techniques. Develop personalized rehabilitation programs.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare",
              reason: "Builds on your healthcare expertise",
              salary: "PHP 30,000–40,000/month",
              requirements: "Strong knowledge of physical therapy techniques, ability to create and follow rehabilitation plans, experience working with injured patients"
            },
            { 
              id: "health-4",
              title: "Medical Coder", 
              company: "Health First Solutions",
              location: "Makati, Philippines", 
              description: "Translate medical diagnoses and procedures into standardized codes for billing and record-keeping purposes. Ensure accurate documentation for healthcare services.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare Administration",
              reason: "Leverages your medical knowledge in an administrative role",
              salary: "PHP 32,000–38,000/month",
              requirements: "Experience in medical coding and billing, strong attention to detail in patient documentation"
            },
            { 
              id: "health-5",
              title: "Emergency Medical Technician (EMT)", 
              company: "LifeCare Ambulance Services",
              location: "Quezon City, Philippines", 
              description: "Provide emergency medical assistance to patients in critical situations. Respond to emergency calls and transport patients to medical facilities.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Emergency Medicine",
              reason: "Aligns with your healthcare training",
              salary: "PHP 28,000–33,000/month",
              requirements: "Certified in emergency response and first aid, ability to remain calm under pressure"
            }
          ];
          
          // Add some business jobs as secondary options
          fallbackJobs.push(
            { 
              id: "business-1",
              title: "Healthcare Administrator", 
              company: "Manila Medical Center",
              location: "Manila, Philippines", 
              description: "Oversee daily operations of healthcare facilities, manage staff, and ensure compliance with healthcare regulations. Develop and implement policies to improve patient care.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare Administration",
              reason: "Career advancement opportunity in healthcare",
              salary: "PHP 50,000–60,000/month",
              requirements: "Healthcare background with administrative experience, knowledge of healthcare regulations, leadership skills"
            },
            { 
              id: "business-2",
              title: "Pharmaceutical Sales Representative", 
              company: "GlaxoSmithKline Philippines",
              location: "Taguig, Philippines", 
              description: "Promote pharmaceutical products to healthcare professionals. Build relationships with doctors and medical facilities to increase product awareness and sales.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Pharmaceutical Sales",
              reason: "Leverages your healthcare knowledge in a business role",
              salary: "PHP 35,000–45,000/month plus commission",
              requirements: "Strong communication skills, healthcare background, sales aptitude"
            },
            { 
              id: "business-3",
              title: "Health Insurance Specialist", 
              company: "PhilHealth",
              location: "Quezon City, Philippines", 
              description: "Review and process health insurance claims. Assist members with understanding their benefits and resolve coverage issues.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare Finance",
              reason: "Combines your healthcare background with administrative skills",
              salary: "PHP 30,000–40,000/month",
              requirements: "Knowledge of healthcare procedures and terminology, attention to detail, customer service skills"
            }
          );
          
        } else if (hasBusinessEducation) {
          primaryCategory = "Business and Finance";
          secondaryCategory = "Technology and IT";
          
          // Business and Finance category
          fallbackJobs = [
            { 
              id: "business-1",
              title: "Financial Analyst", 
              company: "BDO Unibank",
              location: "Makati, Philippines", 
              description: "Analyze financial data to support business decisions. Prepare reports, forecasts, and recommendations to improve financial performance and profitability.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Finance",
              reason: "Aligns with your business/finance education",
              salary: "PHP 45,000–55,000/month",
              requirements: "Proficiency in financial analysis and forecasting, experience in budgeting and accounting principles, strong Excel and Tableau skills"
            },
            { 
              id: "business-2",
              title: "Marketing Manager", 
              company: "Globe Telecom",
              location: "Taguig, Philippines", 
              description: "Develop and implement marketing strategies to promote company products/services. Conduct market research and lead campaigns to increase brand awareness and drive sales.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Marketing",
              reason: "Matches your business background",
              salary: "PHP 50,000–60,000/month",
              requirements: "Experience in market research and analysis, strong knowledge of business strategy development, excellent communication skills"
            },
            { 
              id: "business-3",
              title: "Project Manager", 
              company: "Ayala Corporation",
              location: "Makati, Philippines", 
              description: "Lead project teams to achieve specific objectives within constraints of time, budget, and scope. Plan, execute, and close projects while ensuring alignment with business goals.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Management",
              reason: "Utilizes your business management skills",
              salary: "PHP 60,000–70,000/month",
              requirements: "Proven project management experience, ability to oversee financial reporting and budgeting"
            },
            { 
              id: "business-4",
              title: "Investment Manager", 
              company: "BPI",
              location: "Makati, Philippines", 
              description: "Manage investment portfolios and provide financial advice to clients. Analyze market trends to optimize returns while managing risk according to client goals.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Investment",
              reason: "Leverages your finance education",
              salary: "PHP 55,000–65,000/month",
              requirements: "Experience in investment management, strong understanding of market analysis"
            },
            { 
              id: "business-5",
              title: "Sales Representative", 
              company: "Nestlé Philippines",
              location: "Quezon City, Philippines", 
              description: "Generate new sales and maintain existing client relationships. Meet sales targets through prospecting, negotiations, and relationship management.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Sales",
              reason: "Applies your business acumen in a revenue-generating role",
              salary: "PHP 25,000–35,000/month + commission",
              requirements: "Strong sales techniques, experience in customer relationship management (CRM)"
            }
          ];
          
          // Add some tech jobs as secondary options
          fallbackJobs.push(
            { 
              id: "tech-1",
              title: "Business Intelligence Analyst", 
              company: "Smart Communications",
              location: "Makati, Philippines", 
              description: "Transform complex data into actionable business insights. Create dashboards and reports to support strategic decision-making.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Business Intelligence",
              reason: "Combines your business knowledge with data analysis",
              salary: "PHP 45,000–55,000/month",
              requirements: "SQL knowledge, data visualization skills, business background"
            },
            { 
              id: "tech-2",
              title: "ERP Systems Consultant", 
              company: "Oracle Philippines",
              location: "Taguig, Philippines", 
              description: "Implement and customize enterprise resource planning systems. Analyze business requirements and configure software to meet client needs.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "IT Consulting",
              reason: "Bridges business and technology domains",
              salary: "PHP 50,000–70,000/month",
              requirements: "Business process knowledge, ERP system experience, problem-solving skills"
            },
            { 
              id: "tech-3",
              title: "Digital Marketing Specialist", 
              company: "ABS-CBN Digital",
              location: "Quezon City, Philippines", 
              description: "Execute digital marketing campaigns across various platforms. Use analytics to optimize performance and drive conversions.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Digital Marketing",
              reason: "Modern application of your marketing knowledge",
              salary: "PHP 35,000–45,000/month",
              requirements: "Social media expertise, SEO knowledge, analytics skills"
            }
          );
          
        } else if (hasTechEducation || hasEngineeringEducation) {
          primaryCategory = hasEngineeringEducation ? "Engineering" : "Technology and IT";
          secondaryCategory = "Business and Finance";
          
          if (hasEngineeringEducation) {
            // Engineering category
            fallbackJobs = [
              { 
                id: "eng-1",
                title: "Civil Engineer", 
                company: "DMCI",
                location: "Manila, Philippines", 
                description: "Design, develop, and supervise infrastructure projects such as buildings, roads, and bridges. Ensure projects meet safety standards and environmental regulations.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Civil Engineering",
                reason: "Directly matches your engineering education",
                salary: "PHP 40,000–50,000/month",
                requirements: "Experience with structural analysis, proficiency in computer-aided design (CAD)"
              },
              { 
                id: "eng-2",
                title: "Electrical Engineer", 
                company: "Meralco",
                location: "Quezon City, Philippines", 
                description: "Design, develop, and test electrical systems and components. Ensure compliance with safety regulations and optimize electrical efficiency.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Electrical Engineering",
                reason: "Aligns with your engineering background",
                salary: "PHP 45,000–55,000/month",
                requirements: "Skilled in circuit design and troubleshooting, knowledge of power distribution systems"
              },
              { 
                id: "eng-3",
                title: "Mechanical Engineer", 
                company: "Toyota Philippines",
                location: "Laguna, Philippines", 
                description: "Design and develop mechanical systems and components for manufacturing and production. Analyze and solve complex mechanical problems.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Mechanical Engineering",
                reason: "Utilizes your engineering expertise",
                salary: "PHP 50,000–60,000/month",
                requirements: "Experience in mechanical systems analysis, understanding of thermodynamics"
              },
              { 
                id: "eng-4",
                title: "Environmental Engineer", 
                company: "DENR",
                location: "Manila, Philippines", 
                description: "Develop solutions to environmental problems like pollution control, waste management, and resource conservation. Conduct environmental impact assessments for projects.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Environmental Engineering",
                reason: "Applies your engineering skills to environmental challenges",
                salary: "PHP 35,000–45,000/month",
                requirements: "Knowledge of environmental impact assessment, strong understanding of waste management practices"
              },
              { 
                id: "eng-5",
                title: "Robotics Engineer", 
                company: "Intel Philippines",
                location: "Cavite, Philippines", 
                description: "Design, build, and maintain robotic systems for various applications. Program and test robots to perform specific tasks efficiently and safely.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Robotics",
                reason: "Cutting-edge application of your engineering skills",
                salary: "PHP 60,000–75,000/month",
                requirements: "Experience in robotics and automation"
              }
            ];
          } else {
            // Technology and IT category
            fallbackJobs = [
              { 
                id: "tech-1",
                title: "Software Engineer", 
                company: "Google Philippines",
                location: "Taguig, Philippines", 
                description: "Design, develop, and maintain software applications. Write clean, efficient code and participate in the full software development lifecycle.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Software Development",
                reason: "Directly aligns with your technical education",
                salary: "PHP 70,000–90,000/month",
                requirements: "Proficient in Python, Java, and C++, experience in software development and debugging"
              },
              { 
                id: "tech-2",
                title: "Web Developer", 
                company: "Shopee Philippines",
                location: "Manila, Philippines", 
                description: "Create and maintain websites and web applications. Ensure responsive design and optimal functionality across different browsers and devices.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Web Development",
                reason: "Matches your technical skills",
                salary: "PHP 50,000–60,000/month",
                requirements: "Skilled in HTML, CSS, and JavaScript, experience with responsive web design"
              },
              { 
                id: "tech-3",
                title: "Cybersecurity Specialist", 
                company: "Accenture Philippines",
                location: "Taguig, Philippines", 
                description: "Protect organizational systems and data from cyber threats. Implement security measures, monitor for breaches, and respond to security incidents.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Cybersecurity",
                reason: "Growing field in technology sector",
                salary: "PHP 60,000–75,000/month",
                requirements: "Experience in cybersecurity practices, strong understanding of network troubleshooting"
              },
              { 
                id: "tech-4",
                title: "Data Analyst", 
                company: "Lazada Philippines",
                location: "Makati, Philippines", 
                description: "Collect, process, and analyze data to extract valuable insights. Create reports and visualizations to communicate findings to stakeholders.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "Data Analytics",
                reason: "Leverages your analytical skills",
                salary: "PHP 45,000–55,000/month",
                requirements: "Proficient in data analysis and visualization tools (Excel, Tableau)"
              },
              { 
                id: "tech-5",
                title: "Systems Administrator", 
                company: "IBM Philippines",
                location: "Taguig, Philippines", 
                description: "Maintain and configure computer systems and networks. Ensure the reliable operation of IT infrastructure and troubleshoot technical issues.",
                postedAt: new Date().toISOString(), 
                platform: "IntelliJob",
                url: "#",
                field: "IT Operations",
                reason: "Fundamental IT role matching your background",
                salary: "PHP 50,000–65,000/month",
                requirements: "Experience in systems administration and network configuration"
              }
            ];
          }
          
          // Add some business jobs as secondary options
          fallbackJobs.push(
            { 
              id: "business-1",
              title: "Technical Project Manager", 
              company: "Accenture Philippines",
              location: "Taguig, Philippines", 
              description: "Lead technical projects from inception to completion. Coordinate cross-functional teams and ensure projects meet specifications and deadlines.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Project Management",
              reason: "Combines your technical knowledge with leadership skills",
              salary: "PHP 60,000–80,000/month",
              requirements: "Technical background, project management experience, leadership skills"
            },
            { 
              id: "business-2",
              title: "IT Sales Consultant", 
              company: "Oracle Philippines",
              location: "Makati, Philippines", 
              description: "Sell technical solutions to business clients. Understand clients' technical needs and demonstrate how products solve their challenges.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Sales",
              reason: "Leverages your technical knowledge in a business context",
              salary: "PHP 40,000–50,000/month plus commission",
              requirements: "Technical understanding, sales aptitude, communication skills"
            },
            { 
              id: "business-3",
              title: "Technology Consultant", 
              company: "Deloitte Philippines",
              location: "Taguig, Philippines", 
              description: "Advise businesses on technology strategy and implementation. Help clients leverage technology to improve operations and achieve business goals.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Consulting",
              reason: "Strategic application of your technical expertise",
              salary: "PHP 60,000–80,000/month",
              requirements: "Technical background, business acumen, client management skills"
            }
          );
          
        } else if (hasLawEducation) {
          primaryCategory = "Law and Political Science";
          secondaryCategory = "Business and Finance";
          
          // Law and Political Science category
          fallbackJobs = [
            { 
              id: "law-1",
              title: "Legal Assistant", 
              company: "SyCip Law Office",
              location: "Makati, Philippines", 
              description: "Support lawyers by conducting legal research, drafting documents, and organizing case files. Prepare briefs, contracts, and other legal materials.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Legal Services",
              reason: "Directly applies your legal education",
              salary: "PHP 30,000–40,000/month",
              requirements: "Experience in legal research and analysis, proficiency in contract drafting"
            },
            { 
              id: "law-2",
              title: "Paralegal", 
              company: "Villaraza & Angangco Law",
              location: "Makati, Philippines", 
              description: "Assist attorneys with case preparation, document management, and client communication. Conduct legal research and draft preliminary documents.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Legal Services",
              reason: "Entry-level position in legal field",
              salary: "PHP 35,000–45,000/month",
              requirements: "Strong understanding of litigation procedures"
            },
            { 
              id: "law-3",
              title: "Policy Analyst", 
              company: "Department of Justice",
              location: "Manila, Philippines", 
              description: "Analyze existing policies and propose recommendations for improvement. Research and evaluate the impact of policy changes on various stakeholders.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Public Policy",
              reason: "Leverages your policy knowledge",
              salary: "PHP 40,000–50,000/month",
              requirements: "Experience in public policy analysis"
            },
            { 
              id: "law-4",
              title: "Legal Consultant", 
              company: "Aboitiz Equity Ventures",
              location: "Makati, Philippines", 
              description: "Provide legal advice to businesses on various matters. Review contracts, ensure regulatory compliance, and manage legal risks.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Corporate Law",
              reason: "Applied legal expertise in business environment",
              salary: "PHP 50,000–60,000/month",
              requirements: "Strong legal writing and documentation skills"
            },
            { 
              id: "law-5",
              title: "Contract Specialist", 
              company: "Ayala Land",
              location: "Makati, Philippines", 
              description: "Draft, review, and negotiate contracts to protect company interests. Ensure compliance with relevant laws and regulations in all agreements.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Contract Law",
              reason: "Specialized legal role with high demand",
              salary: "PHP 45,000–55,000/month",
              requirements: "Proficiency in contract drafting and management"
            }
          ];
          
          // Add some business jobs as secondary options
          fallbackJobs.push(
            { 
              id: "business-1",
              title: "Compliance Officer", 
              company: "BDO Unibank",
              location: "Makati, Philippines", 
              description: "Ensure organizational compliance with laws, regulations, and internal policies. Monitor operations, identify risks, and implement preventive measures.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Compliance",
              reason: "Combines your legal knowledge with business operations",
              salary: "PHP 50,000–60,000/month",
              requirements: "Legal background, understanding of regulatory frameworks, attention to detail"
            },
            { 
              id: "business-2",
              title: "Risk Management Specialist", 
              company: "Security Bank",
              location: "Makati, Philippines", 
              description: "Identify and assess potential risks to organization. Develop strategies to mitigate risks and ensure business continuity.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Risk Management",
              reason: "Applies your analytical skills in a business context",
              salary: "PHP 45,000–55,000/month",
              requirements: "Risk assessment skills, regulatory knowledge, analytical thinking"
            },
            { 
              id: "business-3",
              title: "Government Relations Specialist", 
              company: "PLDT",
              location: "Makati, Philippines", 
              description: "Manage relationships between the organization and government entities. Monitor legislative developments and advocate for company interests.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Government Relations",
              reason: "Leverages your understanding of government and policy",
              salary: "PHP 45,000–60,000/month",
              requirements: "Knowledge of government processes, advocacy skills, relationship management"
            }
          );
          
        } else {
          // Default: Show a mix of all categories
          primaryCategory = "Mixed Categories";
          
          // Include top jobs from each category
          fallbackJobs = [
            // Health
            { 
              id: "health-1",
              title: "Registered Nurse", 
              company: "St. Luke's Medical Center",
              location: "Quezon City, Philippines", 
              description: "Join our nursing team to provide high-quality patient care. We're seeking licensed RNs with excellent communication skills and a compassionate approach to healthcare.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare",
              reason: "In-demand healthcare profession",
              salary: "PHP 35,000–45,000/month",
              requirements: "Nursing license, patient care experience, medical knowledge"
            },
            // Business
            { 
              id: "business-1",
              title: "Marketing Manager", 
              company: "Globe Telecom",
              location: "Taguig, Philippines", 
              description: "Develop and implement marketing strategies to promote company products/services. Conduct market research and lead campaigns to increase brand awareness and drive sales.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Marketing",
              reason: "High-growth business field",
              salary: "PHP 50,000–60,000/month",
              requirements: "Marketing experience, strategic thinking, communication skills"
            },
            // Tech
            { 
              id: "tech-1",
              title: "Software Engineer", 
              company: "Google Philippines",
              location: "Taguig, Philippines", 
              description: "Design, develop, and maintain software applications. Write clean, efficient code and participate in the full software development lifecycle.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Software Development",
              reason: "Top-paying technology role",
              salary: "PHP 70,000–90,000/month",
              requirements: "Programming skills, software development experience, problem-solving ability"
            },
            // Engineering
            { 
              id: "eng-1",
              title: "Civil Engineer", 
              company: "DMCI",
              location: "Manila, Philippines", 
              description: "Design, develop, and supervise infrastructure projects such as buildings, roads, and bridges. Ensure projects meet safety standards and environmental regulations.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Civil Engineering",
              reason: "Infrastructure development opportunities",
              salary: "PHP 40,000–50,000/month",
              requirements: "Engineering degree, structural analysis skills, CAD proficiency"
            },
            // Law
            { 
              id: "law-1",
              title: "Legal Assistant", 
              company: "SyCip Law Office",
              location: "Makati, Philippines", 
              description: "Support lawyers by conducting legal research, drafting documents, and organizing case files. Prepare briefs, contracts, and other legal materials.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Legal Services",
              reason: "Entry point to legal profession",
              salary: "PHP 30,000–40,000/month",
              requirements: "Legal research skills, document drafting ability, attention to detail"
            },
            // Additional mix
            { 
              id: "tech-2",
              title: "Data Analyst", 
              company: "Lazada Philippines",
              location: "Makati, Philippines", 
              description: "Collect, process, and analyze data to extract valuable insights. Create reports and visualizations to communicate findings to stakeholders.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Data Analytics",
              reason: "Fast-growing analytical field",
              salary: "PHP 45,000–55,000/month",
              requirements: "Data analysis skills, statistical knowledge, visualization abilities"
            },
            { 
              id: "business-2",
              title: "Financial Analyst", 
              company: "BDO Unibank",
              location: "Makati, Philippines", 
              description: "Analyze financial data to support business decisions. Prepare reports, forecasts, and recommendations to improve financial performance and profitability.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Finance",
              reason: "Stable career in financial sector",
              salary: "PHP 45,000–55,000/month",
              requirements: "Financial analysis skills, Excel proficiency, business acumen"
            },
            { 
              id: "health-2",
              title: "Physical Therapist", 
              company: "MediRehab Center",
              location: "Cebu City, Philippines", 
              description: "Help patients improve their mobility and manage pain through therapeutic exercises and techniques. Develop personalized rehabilitation programs.",
              postedAt: new Date().toISOString(), 
              platform: "IntelliJob",
              url: "#",
              field: "Healthcare",
              reason: "Growing healthcare specialty",
              salary: "PHP 30,000–40,000/month",
              requirements: "Therapy techniques knowledge, patient care skills, rehabilitation experience"
            }
          ];
        }
        
        return new Response(JSON.stringify({
          jobs: fallbackJobs,
          jobTitles,
          categories: [primaryCategory, secondaryCategory].filter(Boolean),
          message: "Using curated job recommendations based on your profile"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response(JSON.stringify({
      jobs,
      jobTitles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in recommend-jobs function:', error);
    
    // Return comprehensive fallback data on error only for non-employer accounts
    const { isEmployer = false } = await req.json().catch(() => ({ isEmployer: false }));
    
    if (isEmployer) {
      return new Response(JSON.stringify({
        jobs: [],
        jobTitles: [],
        error: `Error: ${error.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even on error to avoid client crashes, with error in the payload
      });
    }
    
    // Return comprehensive fallback data even on error for employer accounts
    return new Response(JSON.stringify({
      jobs: [
        { 
          id: "fallback-1",
          title: "Registered Nurse", 
          company: "St. Luke's Medical Center",
          location: "Quezon City, Philippines", 
          description: "Join our nursing team to provide high-quality patient care. We're seeking licensed RNs with excellent communication skills and a compassionate approach to healthcare.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Healthcare",
          reason: "Popular healthcare profession",
          salary: "PHP 35,000–45,000/month"
        },
        { 
          id: "fallback-2",
          title: "Marketing Manager", 
          company: "Globe Telecom",
          location: "Taguig, Philippines", 
          description: "Develop and implement marketing strategies to promote company products/services. Conduct market research and lead campaigns to increase brand awareness and drive sales.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Marketing",
          reason: "Business field with high demand",
          salary: "PHP 50,000–60,000/month"
        },
        { 
          id: "fallback-3",
          title: "Software Engineer", 
          company: "Google Philippines",
          location: "Taguig, Philippines", 
          description: "Design, develop, and maintain software applications. Write clean, efficient code and participate in the full software development lifecycle.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Software Development",
          reason: "Technology role with competitive compensation",
          salary: "PHP 70,000–90,000/month"
        },
        { 
          id: "fallback-4",
          title: "Financial Analyst", 
          company: "BDO Unibank",
          location: "Makati, Philippines", 
          description: "Analyze financial data to support business decisions. Prepare reports, forecasts, and recommendations to improve financial performance and profitability.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Finance",
          reason: "Stable career with growth potential",
          salary: "PHP 45,000–55,000/month"
        },
        { 
          id: "fallback-5",
          title: "Civil Engineer", 
          company: "DMCI",
          location: "Manila, Philippines", 
          description: "Design, develop, and supervise infrastructure projects such as buildings, roads, and bridges. Ensure projects meet safety standards and environmental regulations.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Civil Engineering",
          reason: "Infrastructure development role",
          salary: "PHP 40,000–50,000/month"
        },
        { 
          id: "fallback-6",
          title: "Legal Assistant", 
          company: "SyCip Law Office",
          location: "Makati, Philippines", 
          description: "Support lawyers by conducting legal research, drafting documents, and organizing case files. Prepare briefs, contracts, and other legal materials.",
          postedAt: new Date().toISOString(), 
          platform: "Example",
          url: "#",
          field: "Legal Services",
          reason: "Entry point to legal profession",
          salary: "PHP 30,000–40,000/month"
        },
      ],
      jobTitles: ['Registered Nurse', 'Marketing Manager', 'Software Engineer'],
      error: `Error: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // Return 200 even on error to avoid client crashes, with error in the payload
    });
  }
});
