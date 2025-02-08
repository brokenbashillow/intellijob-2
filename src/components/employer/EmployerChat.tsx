
import { useState } from "react"
import { Bot, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: number
  text: string
  sender: "employer" | "bot"
  timestamp: Date
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
  const { toast } = useToast()

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

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.choices[0].message.content,
        sender: "bot",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, botResponse])
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

        <ScrollArea className="flex-1 p-4">
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
                  <p className="text-sm">{message.text}</p>
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
    </div>
  )
}

export default EmployerChat
