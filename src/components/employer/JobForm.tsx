
import React from "react"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SelectField } from "@/components/shared/SelectField"
import { JobForm, fieldOptions, locationTypeOptions } from "@/types/job"

interface JobFormProps {
  formData: JobForm
  isSubmitting: boolean
  isEdit?: boolean
  onSubmit: () => void
  onCancel: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (name: string, value: string) => void
}

const JobFormComponent: React.FC<JobFormProps> = ({
  formData,
  isSubmitting,
  isEdit = false,
  onSubmit,
  onCancel,
  onChange,
  onSelectChange
}) => {
  const idPrefix = isEdit ? "edit-" : ""
  
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}title`} className="text-right">
            Title
          </Label>
          <Input
            type="text"
            id={`${idPrefix}title`}
            name="title"
            value={formData.title}
            onChange={onChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}field`} className="text-right">
            Field/Industry
          </Label>
          <div className="col-span-3">
            <SelectField
              id={`${idPrefix}field`}
              name="field"
              value={formData.field}
              onChange={onSelectChange}
              options={fieldOptions}
              allowCustomValue={true}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}location_type`} className="text-right">
            Location Type
          </Label>
          <div className="col-span-3">
            <SelectField
              id={`${idPrefix}location_type`}
              name="location_type"
              value={formData.location_type}
              onChange={onSelectChange}
              options={locationTypeOptions}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}location`} className="text-right">
            Address
          </Label>
          <Input
            type="text"
            id={`${idPrefix}location`}
            name="location"
            value={formData.location}
            onChange={onChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}salary`} className="text-right">
            Salary
          </Label>
          <Input
            type="text"
            id={`${idPrefix}salary`}
            name="salary"
            value={formData.salary}
            onChange={onChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${idPrefix}max_applicants`} className="text-right">
            Max Applicants
          </Label>
          <Input
            type="number"
            id={`${idPrefix}max_applicants`}
            name="max_applicants"
            value={formData.max_applicants}
            min="1"
            onChange={onChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor={`${idPrefix}education`} className="text-right mt-2">
            Education
          </Label>
          <Textarea
            id={`${idPrefix}education`}
            name="education"
            value={formData.education}
            onChange={onChange}
            className="col-span-3 min-h-[100px]"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor={`${idPrefix}description`} className="text-right mt-2">
            Description
          </Label>
          <Textarea
            id={`${idPrefix}description`}
            name="description"
            value={formData.description}
            onChange={onChange}
            className="col-span-3 min-h-[120px]"
            rows={5}
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor={`${idPrefix}requirements`} className="text-right mt-2">
            Requirements
          </Label>
          <Textarea
            id={`${idPrefix}requirements`}
            name="requirements"
            value={formData.requirements}
            onChange={onChange}
            className="col-span-3 min-h-[120px]"
            rows={5}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting || !formData.title || !formData.description}
        >
          {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Job" : "Create Job")}
        </Button>
      </DialogFooter>
    </>
  )
}

export default JobFormComponent
