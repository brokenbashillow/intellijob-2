
import JobCard from "./JobCard"

interface Job {
  title: string
  company: string
  location: string
  description: string
  postedAt: string
  platform: string
  url: string
  score?: number
  reason?: string
}

interface JobListProps {
  jobs: Job[]
  title: string
  titleClassName?: string
}

const JobList = ({ jobs, title, titleClassName = "text-primary" }: JobListProps) => {
  if (jobs.length === 0) return null;

  return (
    <>
      <h3 className={`text-lg font-medium mb-3 ${titleClassName}`}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {jobs.map((job, index) => (
          <JobCard key={`${title.toLowerCase()}-${index}`} job={job} />
        ))}
      </div>
    </>
  );
};

export default JobList;
