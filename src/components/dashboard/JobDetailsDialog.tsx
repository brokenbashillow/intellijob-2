
import React from "react"
import { ExternalLink, MapPin, Calendar, Building, GraduationCap, Briefcase, DollarSign } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface JobDetailsProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    description: string
    postedAt: string
    platform: string
    url: string
    field?: string
    education?: string
    salary?: string
    requirements?: string
    aiMatchScore?: number
  }
  isOpen: boolean
  onClose: () => void
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

const JobDetailsDialog: React.FC<JobDetailsProps> = ({ job, isOpen, onClose }) => {
  const { toast } = useToast();
  
  const handleApply = () => {
    // Open the job URL in a new tab
    if (job.url) {
      window.open(job.url, '_blank');
    }
    
    // Show a toast notification
    toast({
      title: "Application started",
      description: `You're being redirected to apply for "${job.title}"`,
    });
    
    // Close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Company and Location */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
          </div>
          
          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.field && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span>Field: <span className="font-medium">{job.field}</span></span>
              </div>
            )}
            {job.education && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <span>Education: <span className="font-medium">{job.education}</span></span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span>Salary: <span className="font-medium">{job.salary}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Posted: <span className="font-medium">{formatDate(job.postedAt)}</span></span>
            </div>
          </div>
          
          {/* AI Match Score */}
          {job.aiMatchScore && (
            <div className="bg-primary/5 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-1">AI Match Analysis</h4>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      job.aiMatchScore > 80 ? 'bg-green-500' : 
                      job.aiMatchScore > 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${job.aiMatchScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{job.aiMatchScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {job.aiMatchScore > 80 
                  ? "Strong match based on your education and experience."
                  : job.aiMatchScore > 60 
                    ? "Moderate match with your profile. Consider if your skills align."
                    : "Lower match score. May require additional qualifications."}
              </p>
            </div>
          )}
          
          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <div className="text-sm whitespace-pre-line">{job.description}</div>
          </div>
          
          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="font-medium mb-2">Requirements</h3>
              <div className="text-sm whitespace-pre-line">{job.requirements}</div>
            </div>
          )}
          
          {/* Source */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Source:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {job.platform}
              <ExternalLink className="h-3 w-3" />
            </Badge>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleApply}>
            Apply Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
