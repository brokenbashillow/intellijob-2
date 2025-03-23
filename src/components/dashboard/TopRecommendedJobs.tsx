
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
  
  // Filter jobs based on strict education and job title alignment
  const strictlyFilteredJobs = jobs.filter(job => {
    // If the job has a reason that mentions education/degree match, it's appropriate
    if (job.reason && /degree|education|background|matches your|psychology|relevant to your/i.test(job.reason)) {
      return true;
    }
    
    // For jobs without an explicit education match reason:
    // Check if it's completely misaligned with the user's background
    
    // Prevent matching agricultural jobs with non-agricultural backgrounds
    const isAgricultureJob = /agriculture|farming|crop|biotech|soil|plant/i.test(job.title || '');
    const userHasAgricultureBackground = userFields.some(field => 
      /agriculture|farming|crop|biotech|soil|plant/i.test(field)
    );
    
    if (isAgricultureJob && !userHasAgricultureBackground) {
      return false;
    }
    
    // Prevent matching engineering jobs with non-engineering backgrounds
    const isEngineeringJob = /engineer|engineering|developer|technical|software/i.test(job.title || '');
    const userHasEngineeringBackground = userFields.some(field => 
      /engineer|engineering|developer|technical|software|computer|IT/i.test(field)
    );
    
    if (isEngineeringJob && !userHasEngineeringBackground) {
      return false;
    }
    
    // Prevent matching healthcare jobs with non-healthcare backgrounds
    const isHealthcareJob = /nurse|nursing|doctor|medical|healthcare|clinical|patient/i.test(job.title || '');
    const userHasHealthcareBackground = userFields.some(field => 
      /nurse|nursing|doctor|medical|healthcare|clinical|patient/i.test(field)
    );
    
    if (isHealthcareJob && !userHasHealthcareBackground) {
      return false;
    }
    
    // Psychology/counseling specific matching
    const isPsychologyJob = /counselor|psychologist|therapist|mental health|psychology|behavioral/i.test(job.title || '');
    const userHasPsychologyBackground = userFields.some(field => 
      /psychology|counseling|therapy|mental health|behavioral/i.test(field)
    );
    
    // If it's a psychology job, only show if user has psychology background
    if (isPsychologyJob) {
      return userHasPsychologyBackground;
    }
    
    // For jobs with high scores that don't fall into the above categories
    if (job.score && job.score > 15) {
      return true;
    }
    
    // Default to showing the job if it passed the other filters and has some match criteria
    return !!job.reason;
  });

  console.log("Strictly filtered jobs:", strictlyFilteredJobs.length);
  
  // If no jobs match after strict filtering, try to show some jobs with decent scores
  if (strictlyFilteredJobs.length === 0) {
    const jobsWithScores = jobs.filter(job => job.score && job.score > 10)
      .slice(0, 3);
    
    if (jobsWithScores.length > 0) {
      console.log("No strictly matched jobs, showing jobs with scores:", jobsWithScores.length);
      return (
        <JobList 
          jobs={jobsWithScores} 
          title="Potential Opportunities" 
          userFields={userFields} 
        />
      );
    }
    
    // If still no jobs, show fallback with a different title
    const fallbackJobs = jobs.slice(0, 3);
    if (fallbackJobs.length > 0) {
      console.log("Showing fallback jobs:", fallbackJobs.length);
      return (
        <JobList 
          jobs={fallbackJobs} 
          title="Available Opportunities" 
          userFields={userFields} 
        />
      );
    }
    
    return null;
  }
  
  // Sort the filtered jobs by score
  const sortedStrictJobs = [...strictlyFilteredJobs]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  return (
    <JobList 
      jobs={sortedStrictJobs} 
      title="Top Matches For You" 
      userFields={userFields} 
    />
  );
};

export default TopRecommendedJobs;
