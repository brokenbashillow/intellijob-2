
import { useEffect, useState } from "react"
import JobCard from "./JobCard"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

interface JobPosting {
  id: string
  title: string
  company?: string
  location?: string
  description?: string
  postedAt?: string
  platform?: string
  url?: string
  field?: string
  score?: number
  reason?: string
  created_at?: string
  requirements?: string
}

// Interface that matches what the RecommendedJobs component expects
interface RecommendedJob {
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
  jobs: RecommendedJob[]
  title: string
  titleClassName?: string
  userFields?: string[] // User's fields of interest/expertise
  fetchFromDatabase?: boolean // Whether to fetch jobs from database
  limit?: number // Optional limit on number of jobs to display
}

const JobList = ({ 
  jobs: initialJobs, 
  title, 
  titleClassName = "text-primary", 
  userFields = [],
  fetchFromDatabase = false,
  limit
}: JobListProps) => {
  const [jobs, setJobs] = useState<RecommendedJob[]>(initialJobs)
  const [isLoading, setIsLoading] = useState(fetchFromDatabase)

  // Fetch jobs from database if fetchFromDatabase is true
  useEffect(() => {
    if (fetchFromDatabase) {
      fetchJobPostings()
    } else {
      setJobs(initialJobs)
    }
  }, [fetchFromDatabase, limit, initialJobs])

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true)
      let query = supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Apply limit if specified
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      
      if (data) {
        // Map the job_postings data to the RecommendedJob interface
        const mappedJobs: RecommendedJob[] = data.map(post => ({
          id: post.id,
          title: post.title,
          company: "IntelliJob", // Default company name since we don't have company_name field
          location: "Remote", // Default location
          description: post.description || "",
          postedAt: post.created_at || new Date().toISOString(),
          platform: "IntelliJob",
          url: `/job/${post.id}`,
          field: post.field,
          requirements: post.requirements
        }))
        
        setJobs(mappedJobs)
      }
    } catch (error) {
      console.error("Error fetching job postings:", error)
      setJobs([]) // Set empty array on error
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
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
          <JobCard key={`${job.id || `${title.toLowerCase()}-${index}`}`} job={job} />
        ))}
      </div>
    </>
  );
};

export default JobList;
