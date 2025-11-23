import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { InviteMembersDialog } from "./invite-members-dialog"

interface HackerHouse {
  id: string
  name: string
  description: string
  location: string
  capacity: number
  currentMembers: number
  checkIn: string
  checkOut: string
  tags: string[]
  amenities: string[]
  hostName: string
  hostAvatar: string
  isMyHouse: boolean
}

interface HackerHouseCardProps {
  house: HackerHouse
  variant: "available" | "my-house"
}

export function HackerHouseCard({ house, variant }: HackerHouseCardProps) {
  const isMyHouse = variant === "my-house"

  return (
    <div className="bg-card/10 hover:bg-card/20 border border-primary/20 hover:border-primary/40 rounded-lg p-4 sm:p-6 transition-all group shadow-[0_0_10px_rgba(var(--primary),0.1)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground font-mono group-hover:text-primary transition-colors">
              {house.name}
            </h3>
            <Badge className="bg-chart-2/20 text-chart-2 border-chart-2 text-[10px] h-5">
              {house.currentMembers}/{house.capacity} members
            </Badge>
            {isMyHouse && (
              <Badge className="bg-primary/20 text-primary border-primary text-[10px] h-5">
                Owner
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {house.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {house.checkIn} - {house.checkOut}
            </span>
          </div>
        </div>
    
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {house.description}
      </p>

      {/* Host */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-card/20 border border-primary/10 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-chart-2" />
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Host
            </p>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {house.hostName}
          </p>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-mono uppercase mb-2">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {house.amenities.map((amenity) => (
            <Badge
              key={amenity}
              className="bg-chart-4/20 text-chart-4 border-chart-4/30 text-[10px] h-5"
            >
              {amenity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-mono uppercase mb-2">
          Looking For
        </p>
        <div className="flex flex-wrap gap-2">
          {house.tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-primary/10 text-primary border-primary/30 text-[10px] h-5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isMyHouse ? (
        <>
          <Link
            href={`/find-hacker-houses/${house.id}`}
            className="flex items-center justify-center w-full bg-chart-2 hover:bg-chart-2/80 text-primary-foreground font-mono text-sm h-10 rounded-md shadow-[0_0_15px_rgba(var(--chart-2),0.3)] hover:shadow-[0_0_25px_rgba(var(--chart-2),0.5)] transition-all mb-3"
          >
            Manage House
          </Link>
          <InviteMembersDialog houseId={house.id} houseName={house.name} />
        </>
      ) : (
        <button
          onClick={() => {
            // TODO: Implement apply logic
            console.log("Apply to house:", house.id)
          }}
          className="flex items-center justify-center w-full bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-sm h-10 rounded-md shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all"
        >
          Apply to Hacker House
        </button>
      )}
    </div>
  )
}
