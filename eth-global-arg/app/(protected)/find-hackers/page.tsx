"use client"

import { BackButton } from "@/components/back-button"
import { HackerCard } from "@/components/hacker-card"
import { HackerDetailDialog } from "@/components/hacker-detail-dialog"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code2, MapPin, MessageSquare, Users, Zap } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Mock data - replace with real API data later
const mockHackers = [
  {
    id: 1,
    name: "Alice Builder",
    avatar: "/spr_catbig_w_capsule.gif",
    location: "Buenos Aires, Argentina",
    role: "Full Stack Developer",
    tags: ["Solidity", "React", "DeFi"],
    rank: 156,
    poaps: 23,
    bio: "Building the future of web3, one block at a time",
    matchScore: 95,
  },
  {
    id: 2,
    name: "Bob Hacker",
    avatar: "/spr_catbig_w_capsule.gif",
    location: "Bangkok, Thailand",
    role: "Smart Contract Dev",
    tags: ["Solidity", "Rust", "NFTs"],
    rank: 234,
    poaps: 18,
    bio: "Passionate about decentralized systems",
    matchScore: 88,
  },
  {
    id: 3,
    name: "Charlie Crypto",
    avatar: "/spr_catbig_w_capsule.gif",
    location: "Denver, USA",
    role: "Frontend Developer",
    tags: ["React", "TypeScript", "Web3"],
    rank: 445,
    poaps: 15,
    bio: "Creating beautiful dApps",
    matchScore: 82,
  },
  {
    id: 4,
    name: "Diana Dev",
    avatar: "/spr_catbig_w_capsule.gif",
    location: "Prague, Czech Republic",
    role: "Backend Engineer",
    tags: ["Node.js", "GraphQL", "IPFS"],
    rank: 312,
    poaps: 20,
    bio: "Decentralization advocate",
    matchScore: 78,
  },
  {
    id: 5,
    name: "Eve Ethereum",
    avatar: "/spr_catbig_w_capsule.gif",
    location: "Brussels, Belgium",
    role: "Product Designer",
    tags: ["UI/UX", "Figma", "Design Systems"],
    rank: 567,
    poaps: 12,
    bio: "Designing the next generation of web3 experiences",
    matchScore: 75,
  },
]

export default function FindHackersPage() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get("location")
  const eventParam = searchParams.get("event")

  //   const { data } = useGetPoapsByEventId({ eventId: "214114" })
  //   console.log("data", data)

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    locationParam
  )

  useEffect(() => {
    if (locationParam) {
      setSelectedLocation(locationParam)
    }
  }, [locationParam])

  const allTags = [
    "Solidity",
    "React",
    "TypeScript",
    "Rust",
    "DeFi",
    "NFTs",
    "Web3",
    "Node.js",
    "GraphQL",
    "IPFS",
    "UI/UX",
    "Smart Contracts",
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filteredHackers = mockHackers.filter((hacker) => {
    const matchesLocation = selectedLocation
      ? hacker.location.includes(selectedLocation)
      : true

    const matchesTags =
      selectedTags.length > 0
        ? hacker.tags.some((tag) => selectedTags.includes(tag))
        : true

    return matchesLocation && matchesTags
  })

  return (
    <div className="min-h-screen bg-background relative">
      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto p-4 pb-0 space-y-4">
          {/* Header */}
          <div className="space-y-4">
            <PageHeader
              icon={Users}
              title="Find Your Squad"
              subtitle="Connect with hackers who share your passion"
              customTrigger={
                <BackButton 
                  location={locationParam}
                  event={eventParam}
                />
              }
            />

            {/* Location Filter */}
            {(selectedLocation || eventParam) && (
              <div className="bg-card/10 border border-chart-2/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-chart-2" />
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Filtering by event:
                    </p>
                    <p className="text-sm font-bold text-chart-2">
                      {eventParam || selectedLocation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedLocation(null)
                    window.history.replaceState({}, "", "/find-hackers")
                  }}
                  className="text-xs text-chart-2 hover:text-chart-2/80 font-mono px-3 py-1.5 bg-card/20 rounded border border-chart-2/30"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* View My Matches */}
            <Link href="/matches" className="block group">
              <div className="bg-linear-to-r from-chart-3/10 to-chart-3/5 hover:from-chart-3/20 hover:to-chart-3/10 border-2 border-chart-3 rounded-lg p-4 transition-all shadow-[0_0_20px_rgba(var(--chart-3),0.2)] hover:shadow-[0_0_30px_rgba(var(--chart-3),0.4)]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-chart-3" />
                      <h3 className="text-chart-3 font-mono text-lg font-bold uppercase tracking-wider">
                        My Matches
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono">
                      View your connections and pending requests
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-chart-3 font-mono">
                        {filteredHackers.length}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        matches
                      </p>
                    </div>
                    <div className="text-2xl">🤝</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Filter by Tags */}
            <div className="bg-card/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Filter by Skills
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        : "bg-card/20 text-muted-foreground border border-border hover:border-primary/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-chart-2 hover:text-chart-2/80 font-mono"
                >
                  ✕ Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Hackers List */}
          <ScrollArea className="h-[calc(100vh-420px)]">
            <div className="space-y-3 pr-4">
              {filteredHackers.map((hacker, index) => (
                <HackerCard
                  key={hacker.id}
                  hacker={hacker}
                  index={index}
                  avatarBadge={
                    <div className="absolute -top-1 -right-1 bg-chart-2 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {hacker.matchScore}%
                    </div>
                  }
                  selectedTags={selectedTags}
                  actionButtons={
                    <div className="flex gap-2 flex-1">
                      <HackerDetailDialog
                        hacker={hacker}
                        selectedTags={selectedTags}
                      />

                      <Button
                        size="sm"
                        className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary text-primary"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Request match
                      </Button>
                    </div>
                  }
                />
              ))}

              {filteredHackers.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground font-mono">
                    <span className="text-chart-2">▸</span> No hackers found
                    with selected skills
                  </p>
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
