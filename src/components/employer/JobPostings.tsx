import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface JobPosting {
  id: number
  title: string
  responses: number
  status?: "done"
}

const JobPostings = () => {
  const [jobPostings] = useState<JobPosting[]>([
    { id: 1, title: "Software Engineer", responses: 0, status: "done" },
    { id: 2, title: "Junior Programmer", responses: 30 },
    { id: 3, title: "Project Manager", responses: 5 },
    { id: 4, title: "Senior Programmer", responses: 15 },
    { id: 5, title: "Dev Ops", responses: 0 },
    { id: 6, title: "Rust Programmer", responses: 4 },
  ])

  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <Button>Add New Job</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobPostings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{job.title}</CardTitle>
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
    </div>
  )
}

export default JobPostings