
import { useState, useEffect } from "react"
import { X, Download, Mail, Phone, UserRound, Briefcase, File, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"

interface JobDetailsProps {
  id?: string
  title?: string
  description?: string
  requirements?: string
  field?: string
}

interface JobResponsesProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
  jobDetails?: JobDetailsProps
}

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  resumeUrl?: string
  skills?: string[]
  experience?: string[]
  status: 'new' | 'reviewed' | 'accepted' | 'rejected'
  appliedAt: string
  profileImage?: string
}

// Sample data for now - in a real app, this would come from the database
const mockApplicants: Applicant[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    skills: ["React", "TypeScript", "Node.js"],
    experience: ["3 years at ABC Tech", "2 years at XYZ Solutions"],
    status: "new",
    appliedAt: new Date().toISOString(),
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    skills: ["Product Management", "UX Research", "Agile"],
    experience: ["5 years at Product Co", "3 years at Design Inc"],
    status: "reviewed",
    appliedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
  }
];

const JobResponses = ({ jobId, isOpen, onClose, jobDetails }: JobResponsesProps) => {
  const { toast } = useToast()
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    if (isOpen) {
      fetchApplicants()
    }
  }, [isOpen, jobId])
  
  const fetchApplicants = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, you would fetch actual applicants from the database
      // For now, we're using mock data and simulating a delay
      setTimeout(() => {
        setApplicants(mockApplicants)
        setIsLoading(false)
      }, 500)
      
      // Example of how real fetching might look:
      /*
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, profiles(*)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      setApplicants(data.map(app => ({
        id: app.id,
        firstName: app.profiles.first_name,
        lastName: app.profiles.last_name,
        email: app.profiles.email,
        phone: app.phone,
        skills: app.skills,
        experience: app.experience,
        status: app.status,
        appliedAt: app.created_at,
        profileImage: app.profiles.avatar_url
      })))
      */
      
    } catch (error: any) {
      console.error('Error fetching applicants:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load applicants.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateApplicantStatus = (applicantId: string, newStatus: Applicant['status']) => {
    setApplicants(prev => 
      prev.map(app => 
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    )
    
    toast({
      title: "Status Updated",
      description: `Applicant status has been updated to ${newStatus}.`,
    })
    
    // In a real implementation, you would update the database here
  }
  
  const filteredApplicants = activeTab === "all" 
    ? applicants 
    : applicants.filter(app => app.status === activeTab)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>
              {jobDetails?.title || "Job"} - Applicants
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All ({applicants.length})</TabsTrigger>
              <TabsTrigger value="new">New ({applicants.filter(a => a.status === 'new').length})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({applicants.filter(a => a.status === 'reviewed').length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({applicants.filter(a => a.status === 'accepted').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <p>Loading applicants...</p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No {activeTab !== "all" ? activeTab : ""} applicants yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplicants.map((applicant) => (
                    <Card key={applicant.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={applicant.profileImage || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {applicant.firstName} {applicant.lastName}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> 
                                {applicant.email}
                                {applicant.phone && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Phone className="h-3 w-3" /> 
                                    {applicant.phone}
                                  </>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              applicant.status === "accepted" ? "default" : 
                              applicant.status === "rejected" ? "destructive" : 
                              applicant.status === "reviewed" ? "secondary" : 
                              "outline"
                            }
                          >
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1.5 flex items-center gap-1">
                              <UserRound className="h-3.5 w-3.5" /> Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {applicant.skills.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="bg-primary/5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {applicant.experience && applicant.experience.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1.5 flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" /> Experience
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {applicant.experience.map((exp, idx) => (
                                <li key={idx}>• {exp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-between items-center pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {applicant.resumeUrl && (
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <Download className="h-3.5 w-3.5" /> Resume
                            </Button>
                          )}
                          
                          {applicant.status !== 'accepted' && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="gap-1.5"
                              onClick={() => updateApplicantStatus(applicant.id, 'accepted')}
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Accept
                            </Button>
                          )}
                          
                          {applicant.status !== 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => updateApplicantStatus(applicant.id, 'rejected')}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                          
                          {applicant.status === 'new' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateApplicantStatus(applicant.id, 'reviewed')}
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default JobResponses
