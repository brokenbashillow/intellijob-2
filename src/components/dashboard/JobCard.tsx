
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  postedAt: string
  platform: string
  url: string
  score?: number
  reason?: string
  requirements?: string
  field?: string
  education?: string
  salary?: string
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

const JobCard = ({ job }: { job: Job }) => {
  // Clean location to remove any hash-like IDs
  const cleanLocation = job.location === "Remote" ? "Remote" : 
    job.location?.replace(/^[a-f0-9-]+\s*/i, "").trim() || "Remote";

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg md:text-xl font-semibold">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow py-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {cleanLocation}
            </Badge>
            <Badge className="bg-primary text-white">
              {job.company}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.field && (
              <Badge variant="secondary" className="bg-secondary/30 text-xs">
                {job.field}
              </Badge>
            )}
            {job.education && (
              <Badge variant="outline" className="text-xs border-amber-300">
                {job.education}
              </Badge>
            )}
            {job.salary && (
              <Badge variant="outline" className="text-xs border-green-300">
                {job.salary}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>
          {job.reason && (
            <p className="text-xs text-primary italic mt-2 line-clamp-2">
              {job.reason}
            </p>
          )}
          {job.score && job.score > 15 && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Strong match
              </span>
            </div>
          )}
          {(job.platform === "Example" || job.platform === "fallback") && (
            <p className="text-xs text-amber-500 mt-2">
              Example job - not from live data
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>Posted {formatDate(job.postedAt)}</span>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center hover:text-primary transition-colors"
        >
          {job.platform} <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
