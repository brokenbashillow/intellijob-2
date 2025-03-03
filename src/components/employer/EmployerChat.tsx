
import { useState, useRef } from "react"
import { Bot, Send, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Message {
  id: number
  text: string
  sender: "employer" | "bot"
  timestamp: Date
  hasJobDetails?: boolean
}

interface ExtractedJobDetails {
  title: string
  description: string
  requirements: string
  field: string
}

const EmployerChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you with job posting suggestions, candidate evaluation, and recruitment strategies. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showJobPostingDialog, setShowJobPostingDialog] = useState(false)
  const [jobDetails, setJobDetails] = useState<ExtractedJobDetails>({
    title: "",
    description: "",
    requirements: "",
    field: ""
  })
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "employer",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('gemini', {
        body: { prompt: newMessage }
      })

      if (error) throw error

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from AI')
      }

      const responseText = data.choices[0].message.content
      
      // Check if the response contains job details
      const hasJobDetails = checkForJobDetails(responseText)
      
      const botResponse: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
        hasJobDetails
      }
      
      setMessages((prev) => [...prev, botResponse])
      
      // Scroll to the latest message
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
    } catch (error: any) {
      console.error('Error getting AI response:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkForJobDetails = (text: string): boolean => {
    // Simple check for keywords that might indicate job details
    const jobKeywords = [
      'job title',
      'position',
      'role:',
      'job requirements',
      'responsibilities',
      'qualifications',
      'experience required',
      'job description'
    ]
    
    return jobKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }
  
  const extractJobDetails = (text: string): ExtractedJobDetails => {
    // This is a simple extraction logic that can be improved
    let title = ""
    let field = ""
    let description = ""
    let requirements = ""
    
    // Extract job title
    const titleMatch = text.match(/(?:job title|position|role):\s*([^\n.]+)/i)
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim()
    }
    
    // Extract field
    const fieldMatch = text.match(/(?:field|industry|sector):\s*([^\n.]+)/i)
    if (fieldMatch && fieldMatch[1]) {
      field = fieldMatch[1].trim()
    }
    
    // Extract job description
    const descriptionMatch = text.match(/(?:job description|responsibilities|about the role):\s*([\s\S]+?)(?=requirements|qualifications|skills required|$)/i)
    if (descriptionMatch && descriptionMatch[1]) {
      description = descriptionMatch[1].trim()
    }
    
    // Extract requirements
    const requirementsMatch = text.match(/(?:requirements|qualifications|skills required):\s*([\s\S]+?)(?=benefits|how to apply|$)/i)
    if (requirementsMatch && requirementsMatch[1]) {
      requirements = requirementsMatch[1].trim()
    }
    
    return {
      title: title || "New Position",
      description,
      requirements,
      field: field || "General"
    }
  }

  const handleCreateJobFromMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return
    
    const extracted = extractJobDetails(message.text)
    setJobDetails(extracted)
    setSelectedMessageId(messageId)
    setShowJobPostingDialog(true)
  }
  
  const handleCreateJob = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a job posting."
        })
        return
      }

      // Form validation
      if (!jobDetails.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Job title is required."
        })
        return
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: jobDetails.title,
          description: jobDetails.description,
          requirements: jobDetails.requirements,
          field: jobDetails.field,
          responses: 0,
          employer_id: user.id
        })
        .select()

      if (error) throw error
      
      setShowJobPostingDialog(false)
      
      toast({
        title: "Success",
        description: "New job has been created.",
      })
      
      // Mark the message as processed
      if (selectedMessageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === selectedMessageId 
              ? { ...msg, hasJobDetails: false } 
              : msg
          )
        )
      }
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job.",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 p-8">
      <Card className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="border-b p-4">
          <h2 className="text-2xl font-bold">Chat Assistant</h2>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "employer" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.sender === "bot" ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback>CN</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === "employer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {message.sender === "bot" && message.hasJobDetails && (
                    <div className="mt-2 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleCreateJobFromMessage(message.id)}
                            >
                              <Plus className="h-3 w-3" /> Create Job
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Create a job posting from this suggestion</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              size="icon"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Job posting dialog */}
      <Dialog open={showJobPostingDialog} onOpenChange={setShowJobPostingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Job Posting</DialogTitle>
            <DialogDescription>
              Review and edit the job details extracted from the AI suggestion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title</label>
              <Input 
                id="title" 
                value={jobDetails.title}
                onChange={(e) => setJobDetails(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="field" className="text-sm font-medium">Field</label>
              <Input 
                id="field" 
                value={jobDetails.field}
                onChange={(e) => setJobDetails(prev => ({ ...prev, field: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea 
                id="description" 
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={jobDetails.description}
                onChange={(e) => setJobDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">Requirements</label>
              <textarea 
                id="requirements" 
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={jobDetails.requirements}
                onChange={(e) => setJobDetails(prev => ({ ...prev, requirements: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobPostingDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateJob}>Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployerChat
