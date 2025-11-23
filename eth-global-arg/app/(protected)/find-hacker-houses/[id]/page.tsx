"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Bot,
  Calendar,
  Home,
  MapPin,
  MessageSquare,
  Send,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Message {
  id: string
  sender: "user" | "ai" | "member"
  senderName?: string
  content: string
  timestamp: string
}

const mockHouseData = {
  id: "1",
  name: "ETH Builders House",
  description:
    "A collaborative space for Ethereum developers working on DeFi protocols and smart contracts. Perfect for builders who want to ship fast.",
  location: "Buenos Aires",
  event: "ETH Global Buenos Aires",
  capacity: 8,
  currentMembers: 5,
  monthlyBudget: 3000,
  checkIn: "Dec 1, 2024",
  checkOut: "Dec 15, 2024",
  tags: ["Solidity", "DeFi", "Smart Contracts", "React"],
  amenities: ["WiFi", "Kitchen", "Workspace", "Meeting Room"],
  hostName: "Alice.eth",
  hostAvatar: "👩‍💻",
}

const mockChatMessages: Message[] = [
  {
    id: "1",
    sender: "member",
    senderName: "Alice.eth",
    content: "Welcome everyone! Excited to have you all here 🎉",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    sender: "member",
    senderName: "Bob.eth",
    content: "Thanks for hosting! When is the first meetup?",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    sender: "user",
    content: "Looking forward to collaborating with everyone!",
    timestamp: "10:35 AM",
  },
]

const mockMembers = [
  {
    id: "1",
    name: "Alice.eth",
    avatar: "/avatars/spr_cat01_walking_.gif",
    x: 20,
    y: 30,
  },
  {
    id: "2",
    name: "Bob.eth",
    avatar: "/avatars/spr_cat02_walking_.gif",
    x: 60,
    y: 40,
  },
  {
    id: "3",
    name: "Charlie.eth",
    avatar: "/avatars/spr_cat03_walking_.gif",
    x: 40,
    y: 60,
  },
  {
    id: "4",
    name: "You",
    avatar: "/avatars/spr_cat04_walking_.gif",
    x: 80,
    y: 20,
  },
  {
    id: "5",
    name: "Eve.eth",
    avatar: "/avatars/spr_cat05_walking_.gif",
    x: 30,
    y: 70,
  },
]

export default function HackerHouseDetailsPage() {
  const [chatMessages, setChatMessages] = useState<Message[]>(mockChatMessages)
  const [newMessage, setNewMessage] = useState("")
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [memberPositions, setMemberPositions] = useState(
    mockMembers.map((m) => ({ id: m.id, x: m.x, y: m.y, facingLeft: false }))
  )

  // Animate members moving randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setMemberPositions((prev) =>
        prev.map((pos) => {
          const deltaX = (Math.random() - 0.5) * 10
          const newX = Math.max(5, Math.min(95, pos.x + deltaX))
          const newY = Math.max(
            5,
            Math.min(95, pos.y + (Math.random() - 0.5) * 10)
          )
          // Voltear el sprite basado en la dirección del movimiento
          const facingLeft = deltaX < 0
          return {
            ...pos,
            x: newX,
            y: newY,
            facingLeft,
          }
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: "ai-1",
      sender: "ai",
      content:
        "Hello! I'm your Trip Planner AI. I can help you plan activities, find restaurants, organize meetups, and make the most of your time in Buenos Aires. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ])
  const [aiInput, setAiInput] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const handleSendAiMessage = () => {
    if (aiInput.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: aiInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setAiMessages([...aiMessages, userMessage])
      setAiInput("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content:
            "I'd be happy to help with that! Buenos Aires has amazing places to visit. Would you like recommendations for restaurants, tourist spots, or hackathon venues nearby?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setAiMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="min-h-dvh p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/find-hacker-houses"
          className="bg-card/10 hover:bg-card/20 border-2 border-primary text-primary font-mono text-sm px-4 sm:px-6 py-2 rounded-md shadow-[0_0_15px_rgba(var(--primary),0.3)] inline-flex items-center justify-center transition-colors gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Link>
        <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
          <DialogTrigger asChild>
            <Button className="bg-chart-3 hover:bg-chart-3/80 text-primary-foreground font-mono text-sm px-4 sm:px-6 py-2 shadow-[0_0_15px_rgba(var(--chart-3),0.3)] gap-2">
              <Bot className="h-4 w-4" />
              Trip Planner AI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90dvh] bg-card border-2 border-chart-3/30 p-0 flex flex-col">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-chart-3/20">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-chart-3" />
                <DialogTitle className="text-lg sm:text-xl font-bold text-chart-3 font-mono uppercase tracking-wider">
                  Trip Planner AI
                </DialogTitle>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-2">
                Get personalized recommendations for your stay
              </p>
            </DialogHeader>

            <ScrollArea className="flex-1 px-4 sm:px-6 py-4 max-h-[60dvh]">
              <div className="space-y-4">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === "user"
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-chart-3/10 border border-chart-3/30"
                      }`}
                    >
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3 w-3 text-chart-3" />
                          <span className="text-xs text-chart-3 font-mono font-bold">
                            Trip Planner AI
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-foreground wrap-break-word">
                        {msg.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-4 sm:px-6 py-4 border-t border-chart-3/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendAiMessage()}
                  placeholder="Ask about places, activities, transport..."
                  className="flex-1 bg-card/20 border border-chart-3/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-chart-3/50 font-mono"
                />
                <Button
                  onClick={handleSendAiMessage}
                  className="bg-chart-3 hover:bg-chart-3/80 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* House Info Card */}
      <div className="bg-card/10 border border-primary/20 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-primary font-mono uppercase tracking-wider">
                {mockHouseData.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {mockHouseData.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {mockHouseData.checkIn} - {mockHouseData.checkOut}
              </span>
              <Badge className="bg-chart-2/20 text-chart-2 border-chart-2 text-[10px] h-5">
                {mockHouseData.currentMembers}/{mockHouseData.capacity} members
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mockHouseData.description}
            </p>
          </div>
          <div className="text-5xl shrink-0">{mockHouseData.hostAvatar}</div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card/20 border border-primary/10 rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-chart-2" />
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Host
              </p>
            </div>
            <p className="text-lg font-bold text-foreground font-mono">
              {mockHouseData.hostName}
            </p>
          </div>
        </div>

        {/* Amenities & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase mb-2">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {mockHouseData.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  className="bg-chart-4/20 text-chart-4 border-chart-4/30 text-[10px] h-5"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase mb-2">
              Looking For
            </p>
            <div className="flex flex-wrap gap-2">
              {mockHouseData.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-primary/10 text-primary border-primary/30 text-[10px] h-5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-card/10 border border-primary/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-chart-2" />
          <h2 className="text-base sm:text-lg font-bold text-chart-2 font-mono uppercase tracking-wider">
            House Members
          </h2>
          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2 text-[10px] h-5">
            {mockMembers.length}/{mockHouseData.capacity}
          </Badge>
        </div>

        {/* Interactive Game Area */}
        <div className="relative w-full h-[400px] bg-card/20 border border-primary/10 rounded-lg overflow-hidden mb-4">
          {/* Background grid effect */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(var(--primary), 0.3) 1px, transparent 1px),
                linear-gradient(rgba(var(--primary), 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Members as animated characters */}
          {mockMembers.map((member, index) => {
            const position = memberPositions[index]
            return (
              <div
                key={member.id}
                className="absolute transition-all duration-2000 ease-in-out"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative group">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 object-contain drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]"
                    style={{
                      transform: position.facingLeft
                        ? "scaleX(-1)"
                        : "scaleX(1)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  />
                  {/* Name tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-card border border-primary/30 px-2 py-1 rounded shadow-[0_0_10px_rgba(var(--primary),0.4)]">
                      <p className="text-xs font-mono text-primary font-bold">
                        {member.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-primary/20" />
          <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-primary/20" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-primary/20" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-primary/20" />
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {mockMembers.map((member) => (
            <div
              key={member.id}
              className="bg-card/20 hover:bg-card/30 border border-primary/10 rounded-lg p-3 transition-all text-center"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 mx-auto mb-2 object-contain"
              />
              <p className="text-xs font-mono text-foreground font-bold truncate">
                {member.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-card/10 border border-primary/20 rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-3 border-b border-primary/20 bg-card/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-primary font-mono uppercase tracking-wider">
              House Chat
            </h2>
          </div>
        </div>

        <ScrollArea className="h-[400px] px-4 sm:px-6 py-4">
          <div className="space-y-4 pb-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-card/20 border border-primary/10"
                  }`}
                >
                  {msg.sender === "member" && (
                    <p className="text-xs text-chart-2 font-mono font-bold mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm text-foreground wrap-break-word">
                    {msg.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-4 sm:px-6 py-4 border-t border-primary/20 bg-card/5 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/80 text-primary-foreground shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
