
import { Job } from "@/hooks/useJobRecommendations";
import JobList from "./JobList";

interface TopRecommendedJobsProps {
  jobs: Job[];
  userFields: string[];
}

const TopRecommendedJobs = ({ jobs, userFields }: TopRecommendedJobsProps) => {
  // Take only the top 3 recommendations
  const topJobs = jobs.slice(0, 3);

  if (topJobs.length === 0) return null;

  return (
    <JobList 
      jobs={topJobs} 
      title="Top Matches For You" 
      userFields={userFields} 
    />
  );
};

export default TopRecommendedJobs;
