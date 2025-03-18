import { useState, useEffect } from "react"
import { ArrowRight, Check, Plus, Users, MessageCircle, Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"
import JobResponses from "./JobResponses"
import JobTemplates from "./JobTemplates"

interface JobPosting {
  id: string
  title: string
  description?: string
  requirements?: string
  field?: string
  responses: number
  status?: string
  accepted_count?: number
}

interface JobTemplate {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  requirements?: string
  field: string
}

interface JobPostingsProps {
  onCreateWithAssistant?: () => void;
}

const JobPostings = ({ onCreateWithAssistant }: JobPostingsProps) => {
  const { toast } = useToast()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [newJob, setNewJob] = useState<Omit<JobPosting, 'id' | 'responses'>>({
    title: "",
    description: "",
    requirements: "",
    field: ""
  })
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  
  useEffect(() => {
    fetchJobPostings()
  }, [])

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setJobPostings(data || [])
    } catch (error: any) {
      console.error('Error fetching job postings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load job postings.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewJob(prev => ({ ...prev, [name]: value }))
  }

  const handleAddJob = async () => {
    try {
      if (!newJob.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Job title is required."
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a job posting."
        })
        return
      }

      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: newJob.title,
          description: newJob.description,
          requirements: newJob.requirements,
          field: newJob.field,
          responses: 0,
          accepted_count: 0,
          employer_id: user.id
        })
        .select()

      if (error) throw error
      
      if (data && data.length > 0) {
        setJobPostings(prev => [data[0], ...prev])
      }
      
      setNewJob({ title: "", description: "", requirements: "", field: "" })
      setIsDialogOpen(false)
      
      toast({
        title: "Success",
        description: "New job has been created.",
      })
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job.",
      })
    }
  }

  const handleViewResponses = (jobId: string) => {
    setSelectedJob(jobId)
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      if (error) throw error
      
      setJobPostings(prev => prev.filter(job => job.id !== jobId))
      
      toast({
        title: "Job Deleted",
        description: "The job posting has been removed.",
      })
    } catch (error: any) {
      console.error('Error deleting job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete job posting.",
      })
    } finally {
      setJobToDelete(null)
    }
  }

  const handleInterviewScheduled = async (jobId: string) => {
    try {
      const job = jobPostings.find(j => j.id === jobId);
      if (!job) return;

      const newAcceptedCount = (job.accepted_count || 0) + 1;
      
      const { error } = await supabase
        .from('job_postings')
        .update({ 
          accepted_count: newAcceptedCount,
          ...(newAcceptedCount >= 5 ? { status: 'done' } : {})
        })
        .eq('id', jobId)

      if (error) throw error;
      
      setJobPostings(prev => prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              accepted_count: newAcceptedCount,
              status: newAcceptedCount >= 5 ? 'done' : j.status 
            } 
          : j
      ));

      if (newAcceptedCount >= 5) {
        toast({
          title: "Job Posting Closed",
          description: "This job has reached 5 accepted applicants and has been marked as done.",
        });
      }
    } catch (error: any) {
      console.error('Error updating job accepted count:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job status.",
      });
    }
  };

  const handleSelectTemplate = (template: JobTemplate) => {
    setNewJob({
      title: template.title,
      description: `${template.company} - ${template.location}\n${template.salary ? `Salary: ${template.salary}\n` : ''}`,
      requirements: template.requirements || "",
      field: template.field
    })
    setIsTemplateDialogOpen(false)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Check className="h-4 w-4" /> Use Template
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onCreateWithAssistant}
          >
            <MessageCircle className="h-4 w-4" /> Create with Assistant
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add New Job
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading job postings...</p>
        </div>
      ) : jobPostings.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No job postings yet. Click 'Add New Job' to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobPostings.map((job) => (
            <Card key={job.id} className={`hover:shadow-lg transition-shadow ${job.status === 'done' ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={() => setJobToDelete(job.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {job.field && (
                  <p className="text-sm text-muted-foreground">Field: {job.field}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {job.status === "done" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" /> Done
                      </span>
                    ) : (
                      <span 
                        className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleViewResponses(job.id)}
                      >
                        <Users className="h-4 w-4" /> {job.responses} {job.responses === 1 ? 'Response' : 'Responses'}
                      </span>
                    )}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewResponses(job.id)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogDescription>
              Create a new job listing for potential candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g. Senior React Developer" 
                value={newJob.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Input 
                id="field" 
                name="field" 
                placeholder="e.g. Programming, Management, Design" 
                value={newJob.field || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the job role and responsibilities" 
                value={newJob.description || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea 
                id="requirements" 
                name="requirements" 
                placeholder="List the skills and qualifications required" 
                value={newJob.requirements || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddJob}>Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <JobTemplates 
            onSelectTemplate={handleSelectTemplate} 
            onClose={() => setIsTemplateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground" 
              onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedJob && (
        <JobResponses 
          jobId={selectedJob} 
          isOpen={!!selectedJob} 
          onClose={() => setSelectedJob(null)} 
          jobDetails={jobPostings.find(job => job.id === selectedJob)}
          onInterviewScheduled={() => handleInterviewScheduled(selectedJob)}
        />
      )}
    </div>
  )
}

export default JobPostings
