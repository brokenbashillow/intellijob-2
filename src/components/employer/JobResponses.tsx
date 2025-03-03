import { useState, useEffect } from "react"
import { X, Download, Mail, Phone, UserRound, Briefcase, File, CheckCircle, XCircle, Eye, Trash, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

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
  onInterviewScheduled?: () => void
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
  userId: string
  interviewDate?: Date | null
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
    userId: "sample-user-id-1",
    interviewDate: null
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
    userId: "sample-user-id-2",
    interviewDate: null
  }
];

const JobResponses = ({ jobId, isOpen, onClose, jobDetails, onInterviewScheduled }: JobResponsesProps) => {
  const { toast } = useToast()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [viewingResume, setViewingResume] = useState<string | null>(null)
  const [interviewDate, setInterviewDate] = useState<Date | null>(null)
  const [interviewTime, setInterviewTime] = useState<string>("09:00")
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      fetchApplicants()
    }
  }, [isOpen, jobId])
  
  const fetchApplicants = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, you would fetch actual applicants from the database
      // This is commented out now but will be used when the real API is ready
      /*
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, profiles(*), resumes(id)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      if (!data || data.length === 0) {
        setApplicants([])
        setIsLoading(false)
        return
      }
      
      const applicantsWithResumes = data.filter(app => app.resumes !== null && app.resumes.length > 0)
      
      setApplicants(applicantsWithResumes.map(app => ({
        id: app.id,
        firstName: app.profiles.first_name || '',
        lastName: app.profiles.last_name || '',
        email: app.profiles.email || '',
        phone: app.phone || '',
        skills: app.skills || [],
        experience: app.experience || [],
        status: app.status || 'new',
        appliedAt: app.created_at,
        profileImage: app.profiles.avatar_url,
        userId: app.profiles.id,
        interviewDate: app.interview_date || null
      })))
      */
      
      // Using mock data for now
      setTimeout(() => {
        setApplicants(mockApplicants)
        setIsLoading(false)
      }, 500)
      
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
  
  const updateApplicantStatus = async (applicantId: string, newStatus: Applicant['status']) => {
    try {
      // In a real implementation, you would update the database
      /*
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicantId)
        
      if (error) throw error
      */
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicantId ? { ...app, status: newStatus } : app
        )
      )
      
      toast({
        title: "Status Updated",
        description: `Applicant status has been updated to ${newStatus}.`,
      })
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update applicant status.",
      })
    }
  }
  
  const handleViewResume = async (applicantId: string, userId: string) => {
    try {
      setViewingResume(applicantId)
      
      // Only mark as reviewed if it's currently new
      const applicant = applicants.find(app => app.id === applicantId)
      if (applicant && applicant.status === 'new') {
        // In a real implementation, you would fetch the resume and update the status
        /*
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .single()
          
        if (resumeError) throw resumeError
        
        // If we successfully retrieved the resume, mark the application as reviewed
        await updateApplicantStatus(applicantId, 'reviewed')
        */
        
        // For now with mock data, just update the status
        await updateApplicantStatus(applicantId, 'reviewed')
      }
      
      // For now, just show a toast to simulate viewing the resume
      toast({
        title: "Resume Viewed",
        description: "The application has been marked as reviewed."
      })
    } catch (error: any) {
      console.error('Error viewing resume:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to view resume.",
      })
    } finally {
      setViewingResume(null)
    }
  }

  const deleteRejectedApplicant = async (applicantId: string) => {
    try {
      // In a real implementation, you would delete the applicant from the database
      /*
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicantId)
        
      if (error) throw error
      */
      
      // Update local state to remove the applicant
      setApplicants(prev => prev.filter(app => app.id !== applicantId))
      
      toast({
        title: "Applicant Removed",
        description: "The rejected applicant has been removed from the list.",
      })
    } catch (error: any) {
      console.error('Error deleting applicant:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete applicant.",
      })
    }
  }

  const scheduleInterview = async (applicantId: string) => {
    try {
      if (!interviewDate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date for the interview.",
        })
        return
      }

      // Combine the date and time
      const dateTime = new Date(interviewDate)
      const [hours, minutes] = interviewTime.split(':').map(Number)
      dateTime.setHours(hours, minutes)

      // In a real implementation, you would update the database and send a notification
      /*
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          interview_date: dateTime.toISOString(),
          status: 'accepted'
        })
        .eq('id', applicantId)
        
      if (error) throw error

      // Send notification to applicant
      const applicant = applicants.find(app => app.id === applicantId)
      if (applicant) {
        await supabase.functions.invoke('notify-interview', {
          body: { 
            applicantEmail: applicant.email,
            applicantName: `${applicant.firstName} ${applicant.lastName}`,
            jobTitle: jobDetails?.title || 'Job Position',
            interviewDate: dateTime.toISOString()
          }
        })
      }
      */
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicantId 
            ? { ...app, status: 'accepted', interviewDate: dateTime } 
            : app
        )
      )

      setSchedulingFor(null)
      setInterviewDate(null)
      setInterviewTime("09:00")
      
      toast({
        title: "Interview Scheduled",
        description: `Interview scheduled for ${format(dateTime, 'PPP')} at ${format(dateTime, 'p')}. The applicant has been notified.`,
      })

      // Call the onInterviewScheduled callback to update the job posting
      if (onInterviewScheduled) {
        onInterviewScheduled();
      }
    } catch (error: any) {
      console.error('Error scheduling interview:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule interview.",
      })
    }
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
                  <p className="text-muted-foreground">
                    No {activeTab !== "all" ? activeTab : ""} applicants yet.
                    {activeTab === "all" && (
                      <span className="block mt-2 text-sm">
                        Only applicants with resumes can apply for this position.
                      </span>
                    )}
                  </p>
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
                          <div className="flex items-center gap-2">
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
                            
                            {applicant.interviewDate && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(applicant.interviewDate), 'MMM d, h:mm a')}
                              </Badge>
                            )}
                          </div>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1.5"
                            onClick={() => handleViewResume(applicant.id, applicant.userId)}
                            disabled={viewingResume === applicant.id}
                          >
                            {viewingResume === applicant.id ? (
                              <>Loading...</>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" /> 
                                View Resume
                              </>
                            )}
                          </Button>
                          
                          {applicant.status !== 'accepted' && !applicant.interviewDate && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-1.5"
                                onClick={() => {
                                  if (applicant.status === 'reviewed') {
                                    setSchedulingFor(applicant.id)
                                  } else {
                                    updateApplicantStatus(applicant.id, 'accepted')
                                  }
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> 
                                {applicant.status === 'reviewed' ? 'Schedule Interview' : 'Accept'}
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => updateApplicantStatus(applicant.id, 'rejected')}
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}

                          {applicant.status === 'rejected' && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="gap-1.5"
                              onClick={() => deleteRejectedApplicant(applicant.id)}
                            >
                              <Trash className="h-3.5 w-3.5" /> Remove
                            </Button>
                          )}

                          {applicant.status === 'accepted' && !applicant.interviewDate && (
                            <Popover open={schedulingFor === applicant.id} onOpenChange={(open) => !open && setSchedulingFor(null)}>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5"
                                  onClick={() => setSchedulingFor(applicant.id)}
                                >
                                  <Calendar className="h-3.5 w-3.5" /> Schedule Interview
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4" align="end">
                                <div className="space-y-4">
                                  <h4 className="font-medium">Schedule Interview</h4>
                                  <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <CalendarComponent
                                      mode="single"
                                      selected={interviewDate}
                                      onSelect={setInterviewDate}
                                      disabled={(date) => date < new Date()}
                                      className="border rounded-md"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="time">Time</Label>
                                    <Input
                                      id="time"
                                      type="time"
                                      value={interviewTime}
                                      onChange={(e) => setInterviewTime(e.target.value)}
                                    />
                                  </div>
                                  <Button 
                                    className="w-full" 
                                    onClick={() => scheduleInterview(applicant.id)}
                                  >
                                    Confirm & Notify
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
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
