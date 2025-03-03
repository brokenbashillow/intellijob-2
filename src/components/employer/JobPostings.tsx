
import { useState, useEffect } from "react"
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
  id: string
  title: string
  description?: string
  requirements?: string
  field?: string
  responses: number
  status?: string
}

const JobPostings = () => {
  const { toast } = useToast()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newJob, setNewJob] = useState<Omit<JobPosting, 'id' | 'responses'>>({
    title: "",
    description: "",
    requirements: "",
    field: ""
  })
  
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
      // Form validation
      if (!newJob.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Job title is required."
        })
        return
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a job posting."
        })
        return
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: newJob.title,
          description: newJob.description,
          requirements: newJob.requirements,
          field: newJob.field,
          responses: 0,
          employer_id: user.id
        })
        .select()

      if (error) throw error
      
      // Update the local state with the new job
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

  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add New Job
        </Button>
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
    </div>
  )
}

export default JobPostings
