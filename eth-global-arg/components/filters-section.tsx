import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, Minus, Plus } from "lucide-react"

interface FiltersSectionProps {
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
  selectedCity: string
  setSelectedCity: (city: string) => void
  selectedBedrooms: number
  incrementBedrooms: () => void
  decrementBedrooms: () => void
  checkInDate: string
  setCheckInDate: (date: string) => void
  checkOutDate: string
  setCheckOutDate: (date: string) => void
  onApply: () => void
  onReset: () => void
  availableCities: string[]
}

export function FiltersSection({
  filtersOpen,
  setFiltersOpen,
  selectedCity,
  setSelectedCity,
  selectedBedrooms,
  incrementBedrooms,
  decrementBedrooms,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  onApply,
  onReset,
  availableCities,
}: FiltersSectionProps) {
  return (
    <div className="bg-card/10 border border-primary/20 rounded-lg overflow-hidden">
      <div className="w-full flex items-center justify-between p-4">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">
            Filters
          </h3>
          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2 text-[10px] h-5">
            Active
          </Badge>
          <div
            className={`transition-transform ml-2 ${
              filtersOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-primary font-mono underline"
        >
          Reset All
        </button>
      </div>

      {filtersOpen && (
        <div className="p-4 border-t border-primary/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* City Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase mb-2 block">
                City
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-card/20 border-primary/30 font-mono">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase mb-2 block">
                Bedrooms
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementBedrooms}
                  disabled={selectedBedrooms === 1}
                  className="bg-card/20 hover:bg-card/30 border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-primary h-10 w-10 rounded-md flex items-center justify-center transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 bg-card/20 border border-primary/30 rounded-md h-10 flex items-center justify-center">
                  <span className="text-sm font-mono font-bold text-foreground">
                    {selectedBedrooms}
                  </span>
                </div>
                <button
                  onClick={incrementBedrooms}
                  disabled={selectedBedrooms === 10}
                  className="bg-card/20 hover:bg-card/30 border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-primary h-10 w-10 rounded-md flex items-center justify-center transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase mb-2 block">
                Check-in
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-card/20 border border-primary/30 rounded-md h-10 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase mb-2 block">
                Check-out
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                className="w-full bg-card/20 border border-primary/30 rounded-md h-10 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onApply}
              className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-sm h-10 rounded-md shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
