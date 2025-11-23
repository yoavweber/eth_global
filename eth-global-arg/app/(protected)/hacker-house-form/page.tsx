"use client"

import { BackButton } from "@/components/back-button"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, Home, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"

const availableTags = [
  "Solidity",
  "React",
  "TypeScript",
  "Web3",
  "DeFi",
  "NFTs",
  "Smart Contracts",
  "Backend",
  "Frontend",
  "Design",
  "DevOps",
  "Testing",
]

export default function HackerHouseFormPage() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get("location")
  const eventParam = searchParams.get("event")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: locationParam || "",
    event: eventParam || "",
    capacity: "",
    monthlyBudget: "",
    budgetPeriod: "month",
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    amenities: "",
    rules: "",
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", { ...formData, tags: selectedTags })
    // TODO: Implement submission logic
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-dvh max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <PageHeader
        icon={Home}
        title="Create Hacker House"
        subtitle="Set up your collaborative space for builders"
        customTrigger={
          <BackButton
            label="← Back to Map"
          />
        }
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-card/10 border border-primary/20 rounded-lg p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-bold text-primary font-mono uppercase tracking-wider">
              Basic Information
            </h3>
          </div>

          {/* House Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              House Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., ETH Builders House"
              className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your hacker house, what makes it special, and what you're looking for..."
              rows={4}
              className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all resize-none"
            />
          </div>

          {/* Location & Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Country"
                className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event
              </label>
              <input
                type="text"
                value={formData.event}
                onChange={(e) =>
                  setFormData({ ...formData, event: e.target.value })
                }
                placeholder="Related hackathon or conference"
                className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3 w-3" /> Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="Maximum number of hackers"
              className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
            />
          </div>

          {/* Budget for Spendings */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Budget for Spendings *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyBudget: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-card/20 border border-primary/30 rounded-md pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
                />
              </div>
              <Select
                value={formData.budgetPeriod}
                onValueChange={(value) =>
                  setFormData({ ...formData, budgetPeriod: value })
                }
              >
                <SelectTrigger className="w-[120px] bg-card/20 border-primary/30 text-foreground font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30">
                  <SelectItem value="week" className="font-mono text-sm">
                    Per Week
                  </SelectItem>
                  <SelectItem value="month" className="font-mono text-sm">
                    Per Month
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Check-in Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-mono bg-card/20 border-primary/30 hover:bg-card/30 text-foreground"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkIn ? (
                      format(formData.checkIn, "PPP")
                    ) : (
                      <span className="text-muted-foreground/50">
                        Pick a date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-2 border-primary/30">
                  <Calendar
                    mode="single"
                    selected={formData.checkIn}
                    onSelect={(date) =>
                      setFormData({ ...formData, checkIn: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Check-out Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-mono bg-card/20 border-primary/30 hover:bg-card/30 text-foreground"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkOut ? (
                      format(formData.checkOut, "PPP")
                    ) : (
                      <span className="text-muted-foreground/50">
                        Pick a date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-2 border-primary/30">
                  <Calendar
                    mode="single"
                    selected={formData.checkOut}
                    onSelect={(date) =>
                      setFormData({ ...formData, checkOut: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="bg-card/10 border border-chart-2/20 rounded-lg p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-chart-2 font-mono uppercase tracking-wider">
              Looking For
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Skills & Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer transition-all text-xs ${
                    selectedTags.includes(tag)
                      ? "bg-chart-2/20 text-chart-2 border-chart-2 shadow-[0_0_10px_rgba(var(--chart-2),0.3)]"
                      : "bg-card/20 text-muted-foreground border-primary/20 hover:bg-card/30"
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-card/10 border border-chart-3/20 rounded-lg p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-chart-3 font-mono uppercase tracking-wider">
              Additional Details
            </h3>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amenities
            </label>
            <textarea
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              placeholder="WiFi, Kitchen, Workspace, etc."
              rows={3}
              className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all resize-none"
            />
          </div>

          {/* House Rules */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              House Rules
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
              placeholder="No smoking, Quiet hours after 11pm, etc."
              rows={3}
              className="w-full bg-card/20 border border-primary/30 rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link
            href="/world"
            className="flex-1 inline-flex items-center justify-center h-12 px-6 rounded-md bg-card/10 hover:bg-card/20 border-2 border-muted text-muted-foreground font-mono text-sm transition-all"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-sm h-12 shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] transition-all"
          >
            Create Hacker House
          </Button>
        </div>
      </form>
    </div>
  )
}
