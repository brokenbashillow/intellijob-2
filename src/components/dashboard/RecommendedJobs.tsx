
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const jobPlatforms = [
  { name: "IntelliJob", url: "#", color: "bg-blue-500" },
  { name: "Indeed", url: "#", color: "bg-blue-600" },
  { name: "Upwork", url: "#", color: "bg-blue-700" },
]

const RecommendedJobs = () => {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold mb-4 md:mb-6">Recommended Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {jobPlatforms.map((platform) => (
          <Card key={platform.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <span>{platform.name}</span>
                <ExternalLink className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  View Jobs
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default RecommendedJobs
