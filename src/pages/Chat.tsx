import { useState, useRef, useEffect } from "react"
import { Bot, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from "react-markdown"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. Based on your assessment results, I can help you find relevant job opportunities or provide career advice. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userInitials, setUserInitials] = useState("")
  const { toast } = useToast()

  const chatRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [botTyping, setBotTyping] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()
        
        if (profileData?.first_name && profileData?.last_name) {
          setUserInitials(`${profileData.first_name[0]}${profileData.last_name[0]}`)
        }
      }
    }
    
    fetchUserProfile()
  }, [])

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  const checkIfAtBottom = () => {
    if (!chatRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
    setIsAtBottom(isAtBottom)
  }

  const typeMessage = (message: string, onUpdate: (text: string) => void, speed = 1, chunkSize = 3) => {
    let index = 0;

    const typeNext = () => {
      if (index < message.length) {
        onUpdate(message.slice(0, index + chunkSize));
        index += chunkSize;
        scrollToBottom(); // Auto-scroll after each update
        setTimeout(typeNext, speed);
      }
    };
  
    typeNext(); // Start typing immediately
    
    const interval = setInterval(() => {
      if (index < message.length) {
        onUpdate(message.slice(0, index + chunkSize));
        index += chunkSize; // Increase chunk size to speed up typing
        scrollToBottom(); // Auto-scroll after each update
      } else {
        clearInterval(interval);
      }
    }, speed); // Lower speed = faster typing
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
  
    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      scrollToBottom(); // Ensure scroll happens after state updates
    }, 100)
    setNewMessage("");
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.functions.invoke("gemini", {
        body: { prompt: newMessage },
      });
  
      if (error) throw error;
      if (!data?.choices?.[0]?.message?.content) throw new Error("Invalid response format from AI");
  
      const botResponse: Message = {
        id: messages.length + 2,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botResponse]);
  
      setBotTyping(true);
  
      typeMessage(data.choices[0].message.content, (typedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botResponse.id ? { ...msg, text: typedMessage } : msg
          )
        );
      }, 1, 5); // 🏎️ FAST: 1ms delay, 5 characters per step
  
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setBotTyping(false);
    }
  };

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

        <div
          className="flex-1 p-4 overflow-y-auto"
          ref={chatRef}
          onScroll={checkIfAtBottom}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  {message.sender === "bot" ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <ReactMarkdown className="text-sm leading-7">{message.text}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>

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

export default Chat
