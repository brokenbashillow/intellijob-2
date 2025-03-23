
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
  
  // Enhanced filtering for strict education and job title alignment
  const strictlyFilteredJobs = jobs.filter(job => {
    // If the job title doesn't exist, skip this job
    if (!job.title) return false;
    
    const jobTitle = job.title.toLowerCase();
    const userFieldsLower = userFields.map(field => field.toLowerCase());
    
    // AGRICULTURE JOBS - Only show if user has matching background
    const agricultureKeywords = [
      'agriculture', 'farming', 'crop', 'biotech', 'soil', 'plant', 
      'environmental engineer', 'agricultural', 'agri'
    ];
    
    const isAgricultureJob = agricultureKeywords.some(keyword => 
      jobTitle.includes(keyword)
    );
    
    const userHasAgricultureBackground = userFieldsLower.some(field => 
      agricultureKeywords.some(keyword => field.includes(keyword))
    );
    
    // Strictly filter out agricultural jobs for non-agricultural backgrounds
    if (isAgricultureJob && !userHasAgricultureBackground) {
      console.log(`Filtered out agriculture job: ${job.title} due to background mismatch`);
      return false;
    }
    
    // ENGINEERING JOBS - Only show if user has matching background
    const engineeringKeywords = [
      'engineer', 'engineering', 'developer', 'technical', 'software', 
      'programmer', 'coding', 'IT specialist', 'system'
    ];
    
    const isEngineeringJob = engineeringKeywords.some(keyword => 
      jobTitle.includes(keyword)
    );
    
    const userHasEngineeringBackground = userFieldsLower.some(field => 
      engineeringKeywords.some(keyword => field.includes(keyword))
    );
    
    // Strictly filter out engineering jobs for non-engineering backgrounds
    if (isEngineeringJob && !userHasEngineeringBackground) {
      console.log(`Filtered out engineering job: ${job.title} due to background mismatch`);
      return false;
    }
    
    // HEALTHCARE JOBS - Only show if user has matching background
    const healthcareKeywords = [
      'nurse', 'nursing', 'doctor', 'medical', 'healthcare', 'clinical', 
      'patient', 'health', 'pharmacist', 'medicine'
    ];
    
    const isHealthcareJob = healthcareKeywords.some(keyword => 
      jobTitle.includes(keyword)
    );
    
    const userHasHealthcareBackground = userFieldsLower.some(field => 
      healthcareKeywords.some(keyword => field.includes(keyword))
    );
    
    // Strictly filter out healthcare jobs for non-healthcare backgrounds
    if (isHealthcareJob && !userHasHealthcareBackground) {
      console.log(`Filtered out healthcare job: ${job.title} due to background mismatch`);
      return false;
    }
    
    // PSYCHOLOGY/EDUCATION JOBS - Always match psychology/education backgrounds with counseling/teaching
    const psychologyKeywords = [
      'counselor', 'psychologist', 'therapist', 'mental health', 'psychology', 
      'behavioral', 'education', 'teacher', 'teaching', 'school', 'special needs'
    ];
    
    const isPsychologyJob = psychologyKeywords.some(keyword => 
      jobTitle.includes(keyword)
    );
    
    const userHasPsychologyBackground = userFieldsLower.some(field => 
      psychologyKeywords.some(keyword => field.includes(keyword))
    );
    
    // If it's a psychology/education job, only show to users with matching background
    if (isPsychologyJob) {
      if (!userHasPsychologyBackground) {
        console.log(`Filtered out psychology/education job: ${job.title} due to background mismatch`);
        return false;
      }
      return true;
    }
    
    // For high quality matches with explicit reasoning
    if (job.reason && /matches your|align|relevant to your/i.test(job.reason) && job.score && job.score > 15) {
      return true;
    }
    
    // Default behavior: be very conservative - only show jobs that have a good reason
    // or are not in a specialized field that requires specific education
    if (!isAgricultureJob && !isEngineeringJob && !isHealthcareJob && !isPsychologyJob) {
      // For generic jobs without specific educational requirements
      if (job.score && job.score > 12) {
        return true;
      }
    }
    
    // If we get here, the job doesn't meet our criteria
    return false;
  });

  console.log(`Filtered from ${jobs.length} to ${strictlyFilteredJobs.length} jobs based on strict alignment`);
  
  // If we have no jobs after strict filtering, try to show at least one good match
  if (strictlyFilteredJobs.length === 0) {
    // Check if we have any jobs that at least mention matching the user's background
    const jobsWithMatchReason = jobs.filter(job => 
      job.reason && /matches your|align|relevant to your/i.test(job.reason) && job.score && job.score > 10
    ).slice(0, 2);
    
    if (jobsWithMatchReason.length > 0) {
      console.log(`No strictly matched jobs, showing ${jobsWithMatchReason.length} jobs with matching reasons`);
      return (
        <JobList 
          jobs={jobsWithMatchReason} 
          title="Potential Matches" 
          userFields={userFields} 
        />
      );
    }
    
    // If still no jobs, show a message instead of random jobs
    return (
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">Job Matches</h3>
        <p className="text-sm text-muted-foreground">
          We couldn't find any jobs that closely match your qualifications. 
          Try updating your profile with more skills and experience to get better recommendations.
        </p>
      </div>
    );
  }
  
  // Sort the filtered jobs by score
  const sortedStrictJobs = [...strictlyFilteredJobs]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, Math.min(2, strictlyFilteredJobs.length)); // Show max 2 jobs if they're properly aligned

  return (
    <JobList 
      jobs={sortedStrictJobs} 
      title="Top Matches For You" 
      userFields={userFields} 
    />
  );
};

export default TopRecommendedJobs;
