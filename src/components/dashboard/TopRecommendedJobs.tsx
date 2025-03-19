
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
  
  // Filter jobs that have a reason indicating education match
  const educationMatchedJobs = jobs.filter(job => 
    job.reason && /match.*education|match.*degree|match.*nursing|match.*healthcare|match.*medical/i.test(job.reason)
  );
  
  // Prioritize: 1. Education matched jobs, 2. Health jobs, 3. Top scored jobs
  let jobsToShow = [];
  
  if (educationMatchedJobs.length > 0) {
    jobsToShow = educationMatchedJobs.slice(0, 3);
  } else if (healthJobs.length >= 3) {
    jobsToShow = healthJobs.slice(0, 3);
  } else {
    // Only use top scored jobs if they have education matches in their reason
    jobsToShow = jobs
      .filter(job => job.reason && /education|degree|background|field/i.test(job.reason))
      .slice(0, 3);
  }

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
