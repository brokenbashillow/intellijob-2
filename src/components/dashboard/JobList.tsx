
import { useEffect, useState } from "react"
import JobCard from "./JobCard"
import { supabase } from "@/integrations/supabase/client"

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  postedAt: string
  platform: string
  url: string
  field?: string
  score?: number
  reason?: string
}

interface JobListProps {
  jobs: Job[]
  title: string
  titleClassName?: string
  userFields?: string[] // User's fields of interest/expertise
  fetchFromDatabase?: boolean // Whether to fetch jobs from database
}

const JobList = ({ 
  jobs: initialJobs, 
  title, 
  titleClassName = "text-primary", 
  userFields = [],
  fetchFromDatabase = false
}: JobListProps) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [isLoading, setIsLoading] = useState(fetchFromDatabase)

  // Fetch jobs from database if fetchFromDatabase is true
  useEffect(() => {
    if (fetchFromDatabase) {
      fetchJobPostings()
    }
  }, [fetchFromDatabase])

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        // Map the job_postings data to the Job interface
        const mappedJobs = data.map(post => ({
          id: post.id,
          title: post.title,
          company: "Company Name", // This would ideally come from the employer profile
          location: "Remote", // Default location
          description: post.description || "",
          postedAt: post.created_at,
          platform: "IntelliJob",
          url: `/job/${post.id}`,
          field: post.field,
          requirements: post.requirements
        }))
        
        setJobs(mappedJobs)
      }
    } catch (error) {
      console.error("Error fetching job postings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter jobs if userFields are provided
  const filteredJobs = userFields.length > 0
    ? jobs.filter(job => 
        // Include jobs that match user fields or have no field specified
        !job.field || 
        userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) || 
          field.toLowerCase().includes(job.field?.toLowerCase() || '')
        )
      )
    : jobs;

  if (isLoading) {
    return (
      <>
        <h3 className={`text-lg font-medium mb-3 ${titleClassName}`}>{title}</h3>
        <div className="flex justify-center py-4">
          <p>Loading jobs...</p>
        </div>
      </>
    )
  }

  if (filteredJobs.length === 0) return null;

  return (
    <>
      <h3 className={`text-lg font-medium mb-3 ${titleClassName}`}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {filteredJobs.map((job, index) => (
          <JobCard key={`${title.toLowerCase()}-${index}`} job={job} />
        ))}
      </div>
    </>
  );
};

export default JobList;
