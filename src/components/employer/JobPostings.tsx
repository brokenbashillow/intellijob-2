import { useState } from "react"
import { Plus, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useJobPostings } from "@/hooks/useJobPostings"
import { Job, JobForm, initialJobFormData } from "@/types/job"
import JobCard from "./JobCard"
import JobFormComponent from "./JobForm"
import JobTemplates from "./JobTemplates"
import JobResponses from "./JobResponses"

const JobPostings = () => {
  const { 
    jobs, 
    isSubmitting, 
    isDeleting, 
    createJob, 
    updateJob, 
    deleteJob 
  } = useJobPostings()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<JobForm>(initialJobFormData)
  const [viewingJobResponses, setViewingJobResponses] = useState<string | null>(null)
  const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(null)
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleCreateJob = async () => {
    const success = await createJob(formData)
    if (success) {
      setFormData(initialJobFormData)
      setIsDialogOpen(false)
    }
  }

  const handleEditJob = async () => {
    if (!selectedJob) return
    
    const success = await updateJob(selectedJob.id, formData)
    if (success) {
      setFormData(initialJobFormData)
      setIsEditOpen(false)
    }
  }

  const handleOpenEditDialog = (job: Job) => {
    let locationType = "On-Site";
    let locationAddress = "";
    
    if (job.location_type) {
      locationType = job.location_type;
    } else if (job.location && job.location.includes(" - ")) {
      const parts = job.location.split(" - ");
      if (parts.length >= 2) {
        locationType = parts[0];
        locationAddress = parts.slice(1).join(" - ");
      } else {
        locationAddress = job.location;
      }
    } else {
      locationAddress = job.location;
    }

    setSelectedJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      field: job.field,
      location_type: locationType,
      location: locationAddress,
      salary: job.salary || "",
      requirements: job.requirements || "",
      education: job.education || "",
      max_applicants: job.max_applicants?.toString() || "5"
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
      max_applicants: "5"
    })
    
    setIsTemplatesDialogOpen(false)
    setIsDialogOpen(true)
  }

  const handleViewJobDetails = (job: Job) => {
    setSelectedJobDetails(job)
    setViewingJobResponses(job.id)
  }
  
  const handleJobResponsesClosed = () => {
    setViewingJobResponses(null)
    setSelectedJobDetails(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsTemplatesDialogOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Job Templates
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Job Posting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job}
            onEdit={handleOpenEditDialog}
            onDelete={deleteJob}
            onViewDetails={handleViewJobDetails}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <JobTemplates 
            onSelectTemplate={handleSelectTemplate} 
            onClose={() => setIsTemplatesDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Posting</DialogTitle>
            <DialogDescription>
              Create a new job posting to attract candidates.
            </DialogDescription>
          </DialogHeader>

          <JobFormComponent
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateJob}
            onCancel={() => setIsDialogOpen(false)}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>Edit your job posting details.</DialogDescription>
          </DialogHeader>

          <JobFormComponent
            formData={formData}
            isSubmitting={isSubmitting}
            isEdit={true}
            onSubmit={handleEditJob}
            onCancel={() => setIsEditOpen(false)}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        </DialogContent>
      </Dialog>

      {viewingJobResponses && selectedJobDetails && (
        <JobResponses 
          jobId={viewingJobResponses}
          isOpen={!!viewingJobResponses}
          onClose={handleJobResponsesClosed}
          jobDetails={{
            id: selectedJobDetails.id,
            title: selectedJobDetails.title,
            description: selectedJobDetails.description,
            requirements: selectedJobDetails.requirements,
            field: selectedJobDetails.field,
            max_applicants: selectedJobDetails.max_applicants
          }}
          onInterviewScheduled={() => {
            // This will refresh the jobs list after an interview is scheduled
          }}
        />
      )}
    </div>
  )
}

export default JobPostings
