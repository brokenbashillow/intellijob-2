
import { useState, useEffect } from "react"
import { Plus, Edit, Clock, FileText, Trash, Users, Briefcase } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SelectField } from "@/components/shared/SelectField"
import JobResponses from "./JobResponses"
import { supabase } from "@/integrations/supabase/client"

interface JobPostings {
  id: string
  title: string
  description: string
  requirements: string
  field: string
  education: string
  responses: number
  status: string
  platform: string
  created_at: string
  updated_at: string
  accepted_count: number
  max_applicants: number
}

const JobPostings = () => {
  const [jobs, setJobs] = useState<JobPostings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewJobDialog, setShowNewJobDialog] = useState(false)
  const [showEditJobDialog, setShowEditJobDialog] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPostings | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [showResponsesDialog, setShowResponsesDialog] = useState(false)
  const [jobDetail, setJobDetail] = useState<JobPostings | null>(null)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    field: "",
    education: "",
    max_applicants: 5
  })
  
  const fieldOptions = [
    { value: "Technology", label: "Technology" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Finance", label: "Finance" },
    { value: "Education", label: "Education" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Administration", label: "Administration" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Engineering", label: "Engineering" },
    { value: "Design", label: "Design" },
    { value: "Other", label: "Other" }
  ]
  
  const educationOptions = [
    { value: "High School", label: "High School" },
    { value: "Associate's Degree", label: "Associate's Degree" },
    { value: "Bachelor's Degree", label: "Bachelor's Degree" },
    { value: "Master's Degree", label: "Master's Degree" },
    { value: "PhD/Doctorate", label: "PhD/Doctorate" },
    { value: "Certification", label: "Certification" },
    { value: "No Requirement", label: "No Requirement" }
  ]
  
  useEffect(() => {
    fetchJobs()
  }, [])
  
  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to view jobs."
        })
        setIsLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setJobs(data || [])
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load job postings."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateJob = async () => {
    try {
      if (!formData.title.trim()) {
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
          description: "You must be logged in to create a job."
        })
        return
      }
      
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          employer_id: user.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          field: formData.field,
          education: formData.education,
          responses: 0,
          max_applicants: formData.max_applicants
        })
        .select()
      
      if (error) throw error
      
      setFormData({
        title: "",
        description: "",
        requirements: "",
        field: "",
        education: "",
        max_applicants: 5
      })
      setShowNewJobDialog(false)
      
      await fetchJobs()
      
      toast({
        title: "Success",
        description: "New job has been created."
      })
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job."
      })
    }
  }
  
  const handleEditJob = async () => {
    try {
      if (!editingJob) return
      
      if (!editingJob.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Job title is required."
        })
        return
      }
      
      const { error } = await supabase
        .from('job_postings')
        .update({
          title: editingJob.title,
          description: editingJob.description,
          requirements: editingJob.requirements,
          field: editingJob.field,
          education: editingJob.education,
          max_applicants: editingJob.max_applicants
        })
        .eq('id', editingJob.id)
      
      if (error) throw error
      
      setEditingJob(null)
      setShowEditJobDialog(false)
      
      await fetchJobs()
      
      toast({
        title: "Success",
        description: "Job has been updated."
      })
    } catch (error: any) {
      console.error('Error updating job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job."
      })
    }
  }
  
  const handleOpenEdit = (job: JobPostings) => {
    setEditingJob(job)
    setShowEditJobDialog(true)
  }
  
  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)
      
      if (error) throw error
      
      await fetchJobs()
      
      toast({
        title: "Success",
        description: "Job has been deleted."
      })
    } catch (error: any) {
      console.error('Error deleting job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete job."
      })
    }
  }
  
  const handleViewResponses = (job: JobPostings) => {
    setSelectedJob(job.id)
    setJobDetail(job)
    setShowResponsesDialog(true)
  }
  
  const handleInterviewScheduled = async () => {
    await fetchJobs()
  }
  
  const filteredJobs = activeTab === "all" 
    ? jobs 
    : activeTab === "active" 
      ? jobs.filter(job => job.status !== "closed" && job.status !== "filled") 
      : jobs.filter(job => job.status === activeTab)
  
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "closed":
        return "outline"
      case "filled":
        return "destructive"
      default:
        return "default"
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (isLoading) {
    return <div className="p-8">Loading job postings...</div>
  }
  
  return (
    <div className="px-8 py-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <Button onClick={() => setShowNewJobDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Job
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Postings ({jobs.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({jobs.filter(job => job.status !== "closed" && job.status !== "filled").length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({jobs.filter(job => job.status === "paused").length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({jobs.filter(job => job.status === "closed" || job.status === "filled").length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No job postings found.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowNewJobDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Job Posting
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="mr-2">{job.title}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>{job.field || "General"}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Posted {formatDate(job.created_at)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="mr-2 h-4 w-4" />
                        {job.platform || "Internal"}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {job.responses} application{job.responses !== 1 ? 's' : ''} 
                        ({job.accepted_count || 0}/{job.max_applicants || 5} accepted)
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewResponses(job)}>
                      <FileText className="mr-2 h-4 w-4" /> View Responses
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Add details for your new job posting
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(80vh-160px)] pr-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="field">Field</Label>
                <SelectField 
                  id="field"
                  options={fieldOptions}
                  value={formData.field}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, field: value }))}
                  placeholder="Select a field"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education Requirement</Label>
                <SelectField 
                  id="education"
                  options={educationOptions}
                  value={formData.education}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
                  placeholder="Select an education requirement"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the job role, responsibilities, etc."
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the requirements for this job"
                  className="min-h-[100px]"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_applicants">Maximum Accepted Applicants</Label>
                <Input
                  id="max_applicants"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Maximum accepted applicants"
                  value={formData.max_applicants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_applicants: parseInt(e.target.value) || 5 }))}
                />
                <p className="text-xs text-muted-foreground">Maximum number of applicants that can be accepted for this position.</p>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateJob}>Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditJobDialog} onOpenChange={setShowEditJobDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update details for your job posting
            </DialogDescription>
          </DialogHeader>
          
          {editingJob && (
            <ScrollArea className="h-[calc(80vh-160px)] pr-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="e.g., Senior Software Engineer"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-field">Field</Label>
                  <SelectField 
                    id="edit-field"
                    options={fieldOptions}
                    value={editingJob.field || ""}
                    onValueChange={(value) => setEditingJob(prev => prev ? { ...prev, field: value } : null)}
                    placeholder="Select a field"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-education">Education Requirement</Label>
                  <SelectField 
                    id="edit-education"
                    options={educationOptions}
                    value={editingJob.education || ""}
                    onValueChange={(value) => setEditingJob(prev => prev ? { ...prev, education: value } : null)}
                    placeholder="Select an education requirement"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Job Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Describe the job role, responsibilities, etc."
                    className="min-h-[100px]"
                    value={editingJob.description || ""}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-requirements">Requirements</Label>
                  <Textarea
                    id="edit-requirements"
                    placeholder="List the requirements for this job"
                    className="min-h-[100px]"
                    value={editingJob.requirements || ""}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, requirements: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-max-applicants">Maximum Accepted Applicants</Label>
                  <Input
                    id="edit-max-applicants"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Maximum accepted applicants"
                    value={editingJob.max_applicants || 5}
                    onChange={(e) => setEditingJob(prev => 
                      prev ? { ...prev, max_applicants: parseInt(e.target.value) || 5 } : null
                    )}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of applicants that can be accepted for this position.</p>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditJobDialog(false)}>Cancel</Button>
            <Button onClick={handleEditJob}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedJob && (
        <JobResponses 
          jobId={selectedJob} 
          isOpen={showResponsesDialog}
          onClose={() => setShowResponsesDialog(false)}
          jobDetails={jobDetail || undefined}
          onInterviewScheduled={handleInterviewScheduled}
        />
      )}
    </div>
  )
}

export default JobPostings

