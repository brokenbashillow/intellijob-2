
export interface Job {
  id: string
  title: string
  description: string
  employer_id: string
  created_at: string
  field: string
  location: string
  location_type?: string
  salary?: string
  education?: string
  requirements?: string
}

export interface JobForm {
  title: string
  description: string
  field: string
  location: string
  location_type: string
  salary?: string
  requirements?: string
  education?: string
}

export const initialJobFormData: JobForm = {
  title: "",
  description: "",
  field: "",
  location: "",
  location_type: "On-Site",
  salary: "",
  requirements: "",
  education: "",
}

export const fieldOptions = [
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

export const locationTypeOptions = [
  { label: "Remote", value: "Remote" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "On-Site", value: "On-Site" },
  { label: "Flexible", value: "Flexible" },
]
