import { useState, useEffect } from "react"
import { Plus, Edit, Clock, FileText, Trash, Users, Briefcase, LayoutTemplate } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SelectField } from "@/components/shared/SelectField"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import JobTemplates from "./JobTemplates"

interface Job {
  id: string
  title: string
  description: string
  employer_id: string
  created_at: string
  field: string
  location: string
  salary?: string
}

interface JobForm {
  title: string
  description: string
  field: string
  location: string
  salary?: string
  requirements?: string
  education?: string
}

const initialFormData: JobForm = {
  title: "",
  description: "",
  field: "",
  location: "",
  salary: "",
  requirements: "",
  education: "",
}

const JobPostings = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<JobForm>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false)

  const fieldOptions = [
    { label: "Technology", value: "Technology" },
    { label: "Healthcare", value: "Healthcare" },
    { label: "Finance", value: "Finance" },
    { label: "Education", value: "Education" },
    { label: "Marketing", value: "Marketing" },
    { label: "Engineering", value: "Engineering" },
    { label: "Design", value: "Design" },
    { label: "Sales", value: "Sales" },
    { label: "Human Resources", value: "Human Resources" },
    { label: "Customer Service", value: "Customer Service" },
    { label: "Other", value: "Other" },
  ]

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate("/")
        return
      }

      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        setJobs(data)
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job postings.",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleCreateJob = async () => {
    try {
      setIsSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate("/")
        return
      }

      const { error } = await supabase
        .from("job_postings")
        .insert([
          {
            ...formData,
            employer_id: user.id,
          },
        ])
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting created successfully.",
      })
      setFormData(initialFormData)
      fetchJobs()
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error creating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job posting.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditJob = async () => {
    if (!selectedJob) return

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from("job_postings")
        .update({
          title: formData.title,
          description: formData.description,
          field: formData.field,
          location: formData.location,
          salary: formData.salary,
        })
        .eq("id", selectedJob.id)
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting updated successfully.",
      })
      setFormData(initialFormData)
      fetchJobs()
      setIsEditOpen(false)
    } catch (error: any) {
      console.error("Error updating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job posting.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setIsDeleting(true)

      const { error } = await supabase.from("job_postings").delete().eq("id", jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting deleted successfully.",
      })
      fetchJobs()
    } catch (error: any) {
      console.error("Error deleting job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete job posting.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenEditDialog = (job: Job) => {
    setSelectedJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      field: job.field,
      location: job.location,
      salary: job.salary || "",
      requirements: "",
      education: "",
    })
    setIsEditOpen(true)
  }

  const handleSelectTemplate = (template: any) => {
    setFormData({
      ...formData,
      title: template.title || "",
      location: template.location || "",
      salary: template.salary || "",
      description: template.description || "",
      requirements: template.requirements || "",
      field: template.field || "",
      education: template.education || "",
    })
    setIsTemplatesDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <div className="flex gap-2">
          <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Job Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <JobTemplates 
                onSelectTemplate={handleSelectTemplate} 
                onClose={() => setIsTemplatesDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
                <DialogDescription>
                  Create a new job posting to attract candidates.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">
                    Salary
                  </Label>
                  <Input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="field" className="text-right">
                    Field
                  </Label>
                  <SelectField
                    name="field"
                    value={formData.field}
                    onChange={handleSelectChange}
                    options={fieldOptions}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateJob} 
                  disabled={isSubmitting || !formData.title || !formData.description}
                >
                  {isSubmitting ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{job.title}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(job)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {job.location} • <Clock className="inline-block h-4 w-4 mr-1" />
                {new Date(job.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{job.description.slice(0, 200)}...</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {job.field}
              </span>
              <Button variant="link" onClick={() => navigate(`/job/${job.id}`)}>
                View Details <FileText className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>Edit your job posting details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">
                    Salary
                  </Label>
                  <Input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="field" className="text-right">
                Field
              </Label>
              <SelectField
                name="field"
                value={formData.field}
                onChange={handleSelectChange}
                options={fieldOptions}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditJob} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default JobPostings
