
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Job, JobForm } from "@/types/job"

export function useJobPostings() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

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

  const createJob = async (formData: JobForm) => {
    try {
      setIsSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate("/")
        return false
      }

      const combinedLocation = formData.location 
        ? `${formData.location_type} - ${formData.location}`
        : formData.location_type

      // Create the job posting data object
      const jobData = {
        title: formData.title,
        description: formData.description,
        field: formData.field,
        location: combinedLocation,
        salary: formData.salary,
        education: formData.education,
        requirements: formData.requirements,
        employer_id: user.id,
        max_applicants: formData.max_applicants ? parseInt(formData.max_applicants) : 5
      }

      // Remove location_type to avoid schema conflicts
      const { error } = await supabase
        .from("job_postings")
        .insert([jobData])

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting created successfully.",
      })
      
      await fetchJobs()
      return true
    } catch (error: any) {
      console.error("Error creating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job posting.",
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateJob = async (jobId: string, formData: JobForm) => {
    try {
      setIsSubmitting(true)

      const combinedLocation = formData.location 
        ? `${formData.location_type} - ${formData.location}`
        : formData.location_type

      // Create the job update data object
      const jobData = {
        title: formData.title,
        description: formData.description,
        field: formData.field,
        location: combinedLocation,
        salary: formData.salary,
        education: formData.education,
        requirements: formData.requirements,
        max_applicants: formData.max_applicants ? parseInt(formData.max_applicants) : 5
      }

      // Remove location_type to avoid schema conflicts
      const { error } = await supabase
        .from("job_postings")
        .update(jobData)
        .eq("id", jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting updated successfully.",
      })
      
      await fetchJobs()
      return true
    } catch (error: any) {
      console.error("Error updating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job posting.",
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      setIsDeleting(true)

      const { error } = await supabase.from("job_postings").delete().eq("id", jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posting deleted successfully.",
      })
      
      await fetchJobs()
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

  return {
    jobs,
    isSubmitting,
    isDeleting,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  }
}
