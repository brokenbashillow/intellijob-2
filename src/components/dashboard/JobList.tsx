
import JobCard from "./JobCard"

interface Job {
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
}

const JobList = ({ jobs, title, titleClassName = "text-primary", userFields = [] }: JobListProps) => {
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
