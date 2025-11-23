"use client"

import { BackButton } from "@/components/back-button"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Trophy,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Mock data - replace with real API data later
const mockEvents = [
  // User's events (my-events)
  {
    id: 1,
    name: "ETH Global Buenos Aires",
    location: "Buenos Aires, Argentina",
    date: "Dec 15-17, 2024",
    dateStart: "2024-12-15",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop",
    description: "The biggest Ethereum hackathon in Latin America",
    participants: 500,
    prizes: "$100,000",
    tags: ["Hackathon", "Web3", "DeFi"],
    website: "https://ethglobal.com/events/buenos-aires",
    isUserEvent: true,
  },
  {
    id: 2,
    name: "Devcon Bangkok",
    location: "Bangkok, Thailand",
    date: "Nov 12-15, 2024",
    dateStart: "2024-11-12",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=400&fit=crop",
    description: "The Ethereum developer conference",
    participants: 3000,
    prizes: "N/A",
    tags: ["Conference", "Developers", "Community"],
    website: "https://devcon.org",
    isUserEvent: true,
  },
  // Upcoming events
  {
    id: 3,
    name: "ETH Denver",
    location: "Denver, USA",
    date: "Feb 28 - Mar 3, 2025",
    dateStart: "2025-02-28",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop",
    description: "The largest Web3 #BUIDLathon in the world",
    participants: 15000,
    prizes: "$500,000",
    tags: ["BUIDLathon", "Innovation", "Community"],
    website: "https://ethdenver.com",
    isUserEvent: false,
  },
  {
    id: 4,
    name: "ETH Prague",
    location: "Prague, Czech Republic",
    date: "May 30 - Jun 1, 2025",
    dateStart: "2025-05-30",
    image: "https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=400&h=400&fit=crop",
    description: "Ethereum hackathon in the heart of Europe",
    participants: 800,
    prizes: "$150,000",
    tags: ["Hackathon", "Europe", "Innovation"],
    website: "https://ethprague.com",
    isUserEvent: false,
  },
  {
    id: 5,
    name: "ETH CC",
    location: "Brussels, Belgium",
    date: "Jul 8-11, 2025",
    dateStart: "2025-07-08",
    image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=400&fit=crop",
    description: "Ethereum Community Conference",
    participants: 2000,
    prizes: "$200,000",
    tags: ["Conference", "Community", "Networking"],
    website: "https://ethcc.io",
    isUserEvent: false,
  },
  {
    id: 6,
    name: "ETH Global London",
    location: "London, UK",
    date: "Mar 20-22, 2025",
    dateStart: "2025-03-20",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=400&fit=crop",
    description: "Building the future of Ethereum in London",
    participants: 1200,
    prizes: "$250,000",
    tags: ["Hackathon", "DeFi", "NFTs"],
    website: "https://ethglobal.com/events/london",
    isUserEvent: false,
  },
  {
    id: 7,
    name: "Web3 Summit Tokyo",
    location: "Tokyo, Japan",
    date: "Apr 15-17, 2025",
    dateStart: "2025-04-15",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=400&fit=crop",
    description: "Asia's premier Web3 conference",
    participants: 2500,
    prizes: "$180,000",
    tags: ["Conference", "Asia", "Innovation"],
    website: "https://web3summit.com",
    isUserEvent: false,
  },
  {
    id: 8,
    name: "ETH Global Istanbul",
    location: "Istanbul, Turkey",
    date: "Jun 10-12, 2025",
    dateStart: "2025-06-10",
    image: "https://images.unsplash.com/photo-1644361567057-22d22d3f6688?w=400&h=400&fit=crop",
    description: "Bridging continents through blockchain",
    participants: 900,
    prizes: "$120,000",
    tags: ["Hackathon", "Web3", "Innovation"],
    website: "https://ethglobal.com/events/istanbul",
    isUserEvent: false,
  },
  // Past events
  {
    id: 9,
    name: "ETH Global San Francisco",
    location: "San Francisco, USA",
    date: "Oct 15-17, 2024",
    dateStart: "2024-10-15",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=400&fit=crop",
    description: "Innovation hub in the heart of Silicon Valley",
    participants: 1800,
    prizes: "$300,000",
    tags: ["Hackathon", "DeFi", "Infrastructure"],
    website: "https://ethglobal.com/events/sf",
    isUserEvent: false,
  },
  {
    id: 10,
    name: "Blockchain Week Berlin",
    location: "Berlin, Germany",
    date: "Sep 10-14, 2024",
    dateStart: "2024-09-10",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop",
    description: "Europe's largest blockchain gathering",
    participants: 3500,
    prizes: "N/A",
    tags: ["Conference", "Europe", "Community"],
    website: "https://blockchainweek.berlin",
    isUserEvent: false,
  },
  {
    id: 11,
    name: "ETH Seoul",
    location: "Seoul, South Korea",
    date: "Aug 20-22, 2024",
    dateStart: "2024-08-20",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop",
    description: "South Korea's premier Ethereum event",
    participants: 1100,
    prizes: "$150,000",
    tags: ["Hackathon", "Asia", "DeFi"],
    website: "https://ethseoul.org",
    isUserEvent: false,
  },
  {
    id: 12,
    name: "Web3 Conference Miami",
    location: "Miami, USA",
    date: "Jul 25-27, 2024",
    dateStart: "2024-07-25",
    image: "https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=400&h=400&fit=crop",
    description: "Where crypto meets culture",
    participants: 2200,
    prizes: "$200,000",
    tags: ["Conference", "NFTs", "Community"],
    website: "https://web3miami.com",
    isUserEvent: false,
  },
]

export default function EventsPage() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get("location")

  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    locationParam
  )
  const [activeTab, setActiveTab] = useState("my-events")

  useEffect(() => {
    if (locationParam) {
      setSelectedLocation(locationParam)
    }
  }, [locationParam])

  // Get current date for filtering
  const currentDate = new Date()

  const filteredEvents = selectedLocation
    ? mockEvents.filter((event) => event.location.includes(selectedLocation))
    : mockEvents

  // Filter by tab
  const tabFilteredEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.dateStart)

    if (activeTab === "my-events") {
      return event.isUserEvent === true
    } else if (activeTab === "upcoming") {
      return eventDate >= currentDate
    } else if (activeTab === "past") {
      return eventDate < currentDate
    }
    return true
  })

  return (
    <div className="min-h-dvh max-w-6xl mx-auto p-4 space-y-2">
      {/* Header */}
      <div className="space-y-4">
        <PageHeader
          icon={Calendar}
          title="Browse Events"
          subtitle="Discover upcoming hackathons and conferences"
          customTrigger={
            <BackButton
              location={selectedLocation}
            />
          }
        />

        {/* Location Filter */}
        {selectedLocation && (
          <div className="bg-card/10 border border-chart-2/30 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-chart-2" />
              <div>
                <p className="text-xs text-muted-foreground font-mono">
                  Filtering by location:
                </p>
                <p className="text-sm font-bold text-chart-2">
                  {selectedLocation}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLocation(null)
                window.history.replaceState({}, "", "/events")
              }}
              className="text-xs text-chart-2 hover:text-chart-2/80 font-mono px-3 py-1.5 bg-card/20 rounded border border-chart-2/30"
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
            <p className="text-2xl font-bold text-primary mt-1">
              {tabFilteredEvents.length}
            </p>
          </div>
          <div className="bg-card/10 border border-chart-2/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-chart-2" />
              <p className="text-xs text-muted-foreground">
                Total Participants
              </p>
            </div>
            <p className="text-2xl font-bold text-chart-2 mt-1">
              {tabFilteredEvents.reduce((acc, e) => acc + e.participants, 0)}
            </p>
          </div>
          <div className="bg-card/10 border border-chart-3/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-chart-3" />
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
            <p className="text-2xl font-bold text-chart-3 mt-1">
              {new Set(tabFilteredEvents.map((e) => e.location)).size}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <ScrollArea className="w-full pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger
                value="my-events"
                className="flex-1 whitespace-nowrap"
              >
                My Events
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="flex-1 whitespace-nowrap"
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 whitespace-nowrap">
                Past Events
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Events List */}
      {tabFilteredEvents.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="text-xl font-bold text-muted-foreground">
              No events found
            </p>
            <p className="text-sm text-muted-foreground font-mono mt-2">
              <span className="text-chart-2">▸</span> Try clearing the filters
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedLocation(null)
              window.history.replaceState({}, "", "/events")
            }}
            className="text-sm text-primary hover:text-primary/80"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100dvh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {tabFilteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="bg-card/10 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  {/* Event Image */}
                  <div className="relative shrink-0">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {event.name}
                        </h3>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-chart-2" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                        <span className="text-primary/30">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-chart-2" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2.5 text-[10px] flex-wrap pt-0.5">
                      <div className="flex items-center gap-1 bg-chart-2/10 px-2 py-0.5 rounded-md border border-chart-2/20">
                        <Users className="h-3 w-3 text-chart-2" />
                        <span className="text-foreground font-medium">
                          {event.participants}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-chart-3/10 px-2 py-0.5 rounded-md border border-chart-3/20">
                        <Trophy className="h-3 w-3 text-chart-3" />
                        <span className="text-foreground font-medium">
                          {event.prizes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-2 py-0 h-5 bg-primary/5 border border-primary/20 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-md w-full bg-primary/10 hover:bg-primary/20 border border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.15)] hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
                  >
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    <span className="text-xs font-mono">Visit</span>
                  </a>
                  <Link
                    href={`/find-hackers?location=${encodeURIComponent(
                      event.location.split(",")[0]
                    )}&event=${encodeURIComponent(event.name)}`}
                    className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-md w-full bg-card/10 hover:bg-card/20 border border-chart-2 text-chart-2 shadow-[0_0_10px_rgba(var(--chart-2),0.15)] hover:shadow-[0_0_15px_rgba(var(--chart-2),0.3)] transition-all"
                  >
                    <Users className="h-3 w-3 mr-1.5" />
                    <span className="text-xs font-mono">Find Hackers</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
