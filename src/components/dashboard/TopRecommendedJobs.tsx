
import { Job } from "@/hooks/useJobRecommendations";
import JobList from "./JobList";

interface TopRecommendedJobsProps {
  jobs: Job[];
  userFields: string[];
}

const TopRecommendedJobs = ({ jobs, userFields }: TopRecommendedJobsProps) => {
  if (!jobs || jobs.length === 0) {
    console.log("No jobs available to display");
    return null;
  }
  
  // Get top scored jobs (those with highest match scores)
  const topScoredJobs = [...jobs]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  // Filter for education matches (highest priority)
  const educationMatchedJobs = jobs.filter(job => 
    job.reason && /degree|education|background|nursing|healthcare|field/i.test(job.reason)
  ).slice(0, 3);
  
  // Filter for location matches (good for convenience)
  const locationMatchedJobs = jobs.filter(job => 
    job.reason && /near you|located|proximity|remote/i.test(job.reason)
  ).slice(0, 3);
  
  // Filter for skills matches (good for capability match)
  const skillsMatchedJobs = jobs.filter(job => 
    job.reason && /skills|experience|relevant/i.test(job.reason)
  ).slice(0, 3);

  // Determine which set of jobs to display
  // Prioritize: 1. Education matches, 2. High-scoring jobs, 3. Skills matches, 4. Location matches, 5. Any jobs
  let jobsToShow = [];
  
  if (educationMatchedJobs.length >= 2) {
    jobsToShow = educationMatchedJobs;
  } else if (topScoredJobs.length > 0) {
    jobsToShow = topScoredJobs;
  } else if (skillsMatchedJobs.length > 0) {
    jobsToShow = skillsMatchedJobs;
  } else if (locationMatchedJobs.length > 0) {
    jobsToShow = locationMatchedJobs;
  } else {
    // Always show at least the top 3 jobs regardless of filter criteria
    jobsToShow = jobs.slice(0, 3);
  }

  // Make sure we always show some jobs if available
  if (jobsToShow.length === 0 && jobs.length > 0) {
    console.log("No filtered jobs matched criteria, showing all available jobs");
    jobsToShow = jobs.slice(0, 3);
  }

  console.log("Jobs to show:", jobsToShow.length, jobsToShow);

  return (
    <JobList 
      jobs={jobsToShow} 
      title="Top Matches For You" 
      userFields={userFields} 
    />
  );
};

export default TopRecommendedJobs;
