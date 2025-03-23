
import React from "react"
import { Edit, Clock, FileText, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onViewDetails: (job: Job) => void
  isDeleting: boolean
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onEdit, 
  onDelete, 
  onViewDetails,
  isDeleting 
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-start">
          <span className="truncate">{job.title}</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          {job.location} • <Clock className="inline-block h-3 w-3" />
          {new Date(job.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm line-clamp-3">{job.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2 pb-3 border-t">
        <div className="flex justify-between items-center w-full">
          <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {job.field}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => onEdit(job)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job.id)}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 h-8 px-2"
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => onViewDetails(job)}
          className="px-0 h-7 flex justify-start text-blue-600 hover:text-blue-800"
        >
          View Details <FileText className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default JobCard
