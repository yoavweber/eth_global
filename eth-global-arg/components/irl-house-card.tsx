import {
  MapPin,
  Star,
  Bed,
  ExternalLink,
  DollarSign,
  Shield,
  Wifi,
} from "lucide-react"
import type { HackerHouse as HackerHouseListing } from "@/types/hacker-houses"

interface IRLHouseCardProps {
  house: HackerHouseListing
}

export function IRLHouseCard({ house }: IRLHouseCardProps) {
  return (
    <div className="bg-card/10 hover:bg-card/20 border border-primary/20 hover:border-primary/40 rounded-lg overflow-hidden transition-all group shadow-[0_0_10px_rgba(var(--primary),0.1)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Image Gallery */}
        <div className="relative h-64 md:h-auto overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
            {house.images.slice(0, 4).map((img: string, idx: number) => (
              <div key={idx} className="relative overflow-hidden rounded-md">
                <img
                  src={img}
                  alt={`${house.name} ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2 p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-mono group-hover:text-primary transition-colors mb-2">
                  {house.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {house.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {house.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {house.rating} ({house.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {house.bedrooms} bedrooms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card/20 border border-primary/10 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-chart-3" />
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Price/Month
                </p>
              </div>
              <p className="text-xl font-bold text-chart-3 font-mono">
                ${house.price}
              </p>
            </div>

            <div className="bg-card/20 border border-primary/10 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-chart-2" />
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Safety
                </p>
              </div>
              <p className="text-xl font-bold text-chart-2 font-mono">
                {house.safetyScore}/10
              </p>
            </div>

            <div className="bg-card/20 border border-primary/10 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="h-4 w-4 text-chart-4" />
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Workspace
                </p>
              </div>
              <p className="text-xl font-bold text-chart-4 font-mono">
                {house.workspaceScore}/10
              </p>
            </div>

            <div className="bg-card/20 border border-primary/10 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Distance
                </p>
              </div>
              <p className="text-xl font-bold text-primary font-mono">
                {house.distanceToEvent === 0
                  ? "0km"
                  : `${house.distanceToEvent}km`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={house.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-sm h-10 rounded-md shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all"
            >
              View on Airbnb
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
