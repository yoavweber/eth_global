"use client"

import { useState, useMemo } from "react"
import { BackButton } from "@/components/back-button"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HackerHouseCard } from "@/components/hacker-house-card"
import { IRLHouseCard } from "@/components/irl-house-card"
import { FiltersSection } from "@/components/filters-section"
import { EmptyState } from "@/components/empty-state"
import { useHackerHouseFilters } from "@/hooks/use-hacker-house-filters"
import { Home, Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useGetAllHackerHouses } from "@/services/api/hacker-houses"
import type { HackerHouse as HackerHouseListing } from "@/types/hacker-houses"

interface HackerHouse {
  id: string
  name: string
  description: string
  location: string
  event: string
  capacity: number
  currentMembers: number
  monthlyBudget: number
  checkIn: string
  checkOut: string
  tags: string[]
  amenities: string[]
  hostName: string
  hostAvatar: string
  isMyHouse: boolean
}

const mockHackerHouses: HackerHouse[] = [
  {
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
    isMyHouse: true,
  },
  {
    id: "2",
    name: "Web3 Creative Hub",
    description:
      "Design-focused hacker house for builders creating beautiful Web3 experiences. Frontend devs and designers welcome!",
    location: "Buenos Aires",
    event: "ETH Global Buenos Aires",
    capacity: 6,
    currentMembers: 4,
    monthlyBudget: 2500,
    checkIn: "Nov 28, 2024",
    checkOut: "Dec 20, 2024",
    tags: ["Frontend", "Design", "React", "TypeScript"],
    amenities: ["WiFi", "Kitchen", "Garden", "Library"],
    hostName: "Bob.eth",
    hostAvatar: "🎨",
    isMyHouse: false,
  },
  {
    id: "3",
    name: "Protocol Research Lab",
    description:
      "For serious researchers and protocol developers. Quiet environment focused on deep work and technical discussions.",
    location: "Buenos Aires",
    event: "ETH Global Buenos Aires",
    capacity: 10,
    currentMembers: 7,
    monthlyBudget: 4000,
    checkIn: "Dec 5, 2024",
    checkOut: "Jan 5, 2025",
    tags: ["Solidity", "Backend", "Testing", "DevOps"],
    amenities: ["WiFi", "Kitchen", "Workspace", "Gym", "Parking"],
    hostName: "Charlie.eth",
    hostAvatar: "🔬",
    isMyHouse: false,
  },
]

// Cities from the world map
const AVAILABLE_CITIES = [
  "Buenos Aires",
  "Bangkok",
  "Denver",
  "Prague",
  "Brussels",
  "Pyongyang",
]

export default function FindHackerHousesPage() {
  const searchParams = useSearchParams()
  const location = searchParams.get("location")
  const event = searchParams.get("event")

  const [filtersOpen, setFiltersOpen] = useState(false)

  // Use the custom hook for filter management
  const {
    selectedCity,
    setSelectedCity,
    selectedBedrooms,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    appliedCity,
    appliedBedrooms,
    appliedCheckInDate,
    appliedCheckOutDate,
    incrementBedrooms,
    decrementBedrooms,
    applyFilters,
    resetFilters,
  } = useHackerHouseFilters({ initialCity: location || "Buenos Aires" })

  const { data, isLoading, error } = useGetAllHackerHouses({
    city: appliedCity,
    bedrooms: appliedBedrooms,
    checkInDate: appliedCheckInDate,
    checkOutDate: appliedCheckOutDate,
  })

  const filteredHouses = mockHackerHouses.filter(
    (house) =>
      (!location || house.location === location) &&
      (!event || house.event === event) &&
      house.location === appliedCity &&
      house.capacity >= appliedBedrooms
  )

  // Usar los datos de la API directamente
  const hackerHouses: HackerHouseListing[] = useMemo(() => {
    return data?.listings || []
  }, [data])

  return (
    <div className="min-h-dvh p-4 space-y-4">
      {/* Header */}
      <PageHeader
        icon={Home}
        title={
          location ? `Hacker Houses in ${location}` : "Discover Hacker Houses"
        }
        subtitle={event || "Find your perfect collaborative space"}
        customTrigger={
          <BackButton location={location} event={event} label="← Back to Map" />
        }
      />

      {/* Create House CTA */}
      <Link
        href={`/hacker-house-form?location=${encodeURIComponent(
          location || ""
        )}&event=${encodeURIComponent(event || "")}`}
        className="block w-full bg-linear-to-r from-chart-3/10 to-chart-3/5 hover:from-chart-3/20 hover:to-chart-3/10 border-2 border-chart-3 rounded-lg p-4 transition-all shadow-[0_0_20px_rgba(var(--chart-3),0.2)] hover:shadow-[0_0_30px_rgba(var(--chart-3),0.4)]"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-chart-3" />
              <h3 className="text-chart-3 font-mono text-lg font-bold uppercase tracking-wider">
                Create Your Hacker House
              </h3>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              Host builders and grow your network
            </p>
          </div>
          <div className="text-3xl">🏠</div>
        </div>
      </Link>

      {/* Filters */}
      <FiltersSection
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedBedrooms={selectedBedrooms}
        incrementBedrooms={incrementBedrooms}
        decrementBedrooms={decrementBedrooms}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        onApply={applyFilters}
        onReset={resetFilters}
        availableCities={AVAILABLE_CITIES}
      />

      {/* Hacker Houses List */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="available">Virtual Houses</TabsTrigger>
          <TabsTrigger value="my-houses">My Houses</TabsTrigger>
          <TabsTrigger value="irl-houses">IRL Houses</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          <div className="space-y-4">
            {filteredHouses.filter((house) => !house.isMyHouse).length === 0 ? (
              <EmptyState
                message="No available hacker houses found in this location yet."
                submessage="Be the first to create one!"
              />
            ) : (
              filteredHouses
                .filter((house) => !house.isMyHouse)
                .map((house) => (
                  <HackerHouseCard
                    key={house.id}
                    house={house}
                    variant="available"
                  />
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-houses" className="mt-4">
          <div className="space-y-4">
            {filteredHouses.filter((house) => house.isMyHouse).length === 0 ? (
              <EmptyState
                message="You haven't created any hacker houses yet."
                submessage="Create your first one to get started!"
              />
            ) : (
              filteredHouses
                .filter((house) => house.isMyHouse)
                .map((house) => (
                  <HackerHouseCard
                    key={house.id}
                    house={house}
                    variant="my-house"
                  />
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="irl-houses" className="mt-4">
          {isLoading ? (
            <div className="bg-card/10 border border-primary/20 rounded-lg p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">
                Loading hacker houses...
              </p>
            </div>
          ) : error ? (
            <div className="bg-card/10 border border-red-500/20 rounded-lg p-8 text-center">
              <p className="text-red-500 font-mono mb-2">
                Error loading hacker houses
              </p>
              <p className="text-muted-foreground font-mono text-sm">
                {error instanceof Error
                  ? error.message
                  : "Please try again later"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hackerHouses.length === 0 ? (
                <EmptyState
                  message="No IRL hacker houses found matching your filters."
                  submessage="Try adjusting your filters or check back later!"
                />
              ) : (
                hackerHouses.map((house) => (
                  <IRLHouseCard key={house.id} house={house} />
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
