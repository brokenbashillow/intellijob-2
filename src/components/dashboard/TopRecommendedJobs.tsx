
import { Job } from "@/hooks/useJobRecommendations";
import JobList from "./JobList";

interface TopRecommendedJobsProps {
  jobs: Job[];
  userFields: string[];
}

const TopRecommendedJobs = ({ jobs, userFields }: TopRecommendedJobsProps) => {
  // Filter for health-related jobs if available 
  const healthJobs = jobs.filter(job => 
    /healthcare|medical|health|nurse|hospital|clinic|patient|therapy|pharma/i.test(
      `${job.title} ${job.field || ''} ${job.description || ''}`
    )
  );
  
  // Use health jobs if available, otherwise use top scored jobs
  const jobsToShow = healthJobs.length >= 3 ? healthJobs.slice(0, 3) : jobs.slice(0, 3);

  if (jobsToShow.length === 0) return null;

  return (
    <JobList 
      jobs={jobsToShow} 
      title="Top Matches For You" 
      userFields={userFields} 
    />
  );
};

export default TopRecommendedJobs;
