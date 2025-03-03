
import { useState } from "react"
import { ArrowRight, Check, Plus } from "lucide-react"
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
import { supabase } from "@/integrations/supabase/client"

interface JobPosting {
  id: number | string
  title: string
  description?: string
  requirements?: string
  field?: string
  responses: number
  status?: "done"
}

const JobPostings = () => {
  const { toast } = useToast()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    { id: 1, title: "Software Engineer", responses: 0, status: "done" },
    { id: 2, title: "Junior Programmer", responses: 30, field: "Programming" },
    { id: 3, title: "Project Manager", responses: 5, field: "Management" },
    { id: 4, title: "Senior Programmer", responses: 15, field: "Programming" },
    { id: 5, title: "Dev Ops", responses: 0, field: "DevOps" },
    { id: 6, title: "Rust Programmer", responses: 4, field: "Programming" },
  ])
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newJob, setNewJob] = useState<Omit<JobPosting, 'id' | 'responses'>>({
    title: "",
    description: "",
    requirements: "",
    field: ""
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewJob(prev => ({ ...prev, [name]: value }))
  }

  const handleAddJob = async () => {
    try {
      // Form validation
      if (!newJob.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Job title is required."
        })
        return
      }

      // In a real implementation, we would save to Supabase here
      // For now, just add to local state with a generated ID
      const newJobWithId: JobPosting = {
        id: `job-${Date.now()}`,
        ...newJob,
        responses: 0
      }
      
      setJobPostings(prev => [...prev, newJobWithId])
      setNewJob({ title: "", description: "", requirements: "", field: "" })
      setIsDialogOpen(false)
      
      toast({
        title: "Success",
        description: "New job has been created.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job.",
      })
    }
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobPostings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{job.title}</CardTitle>
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
                    `${job.responses} Responses`
                  )}
                </span>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  )
}

export default JobPostings
