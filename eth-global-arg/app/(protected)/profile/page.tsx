"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  useIsUsernameAvailable,
  useGetPriceOfRegistration,
  useFindAvailableNonce,
  useNameServiceSignatureBuilder,
  usePreRegisterUsername,
  useRegisterUsername,
  useGetOwnerOfIdentity,
  useVerifyIfIdentityExists,
} from "@/hooks/useEvvmNameService"
import { useGetAllPoapsByAddress } from "@/services/api/poap"
import { useGetProfileTalentProtocol } from "@/services/api/talent-protocol"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trophy,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { ProfileSkeleton } from "./profile-skeleton"
import { PoapSkeleton } from "./poap-skeleton"

type NameServiceDialogProps = {
  address?: `0x${string}`
  skills?: string[]
}

function NameServiceDialog({ address, skills }: NameServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const effectiveUsername = open ? username.trim() : ""

  const {
    isAvailable,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
  } = useIsUsernameAvailable(effectiveUsername)

  const {
    price,
    isLoading: isPriceLoading,
  } = useGetPriceOfRegistration(effectiveUsername)

  const {
    exists,
    isLoading: isExistsLoading,
    isError: isExistsError,
  } = useVerifyIfIdentityExists(effectiveUsername)

  const {
    owner,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
  } = useGetOwnerOfIdentity(effectiveUsername)

  const {
    nonce,
    findNonce,
    isLoading: isNonceLoading,
  } = useFindAvailableNonce(
    (address || "0x0000000000000000000000000000000000000000") as `0x${string}`
  )

  const { signPreRegistration, signRegistration } =
    useNameServiceSignatureBuilder()
  const { execute: preRegister, isPending: isPrePending } =
    usePreRegisterUsername()
  const { execute: register, isPending: isRegPending } = useRegisterUsername()

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setUsername("")
      setSelectedSkills(skills || [])
      setError(null)
      setSuccess(null)
      if (address) {
        findNonce()
      }
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const canSubmit =
    !!address &&
    !!effectiveUsername &&
    !isAvailabilityLoading &&
    isAvailable &&
    !!price &&
    !!nonce &&
    !isSubmitting &&
    !isPrePending &&
    !isRegPending &&
    !isPriceLoading &&
    !isNonceLoading

  const priceLabel =
    price && typeof price === "bigint" ? formatEther(price) : undefined

  useEffect(() => {
    if (!effectiveUsername) return
    // Debug log to verify contract responses for availability vs existence
    console.log("EVVM NameService debug", {
      username: effectiveUsername,
      isAvailable,
      exists,
      owner,
      isAvailabilityLoading,
      isExistsLoading,
      isOwnerLoading,
      isAvailabilityError,
      isExistsError,
      isOwnerError,
    })
  }, [
    effectiveUsername,
    isAvailable,
    exists,
    owner,
    isAvailabilityLoading,
    isExistsLoading,
    isOwnerLoading,
    isAvailabilityError,
    isExistsError,
    isOwnerError,
  ])

  const handleCreate = async () => {
    if (!canSubmit || !address || !nonce || !price) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const randomBytes = new Uint8Array(8)
      crypto.getRandomValues(randomBytes)
      let clowNumber = BigInt(0)
      for (const b of randomBytes) {
        clowNumber = (clowNumber << BigInt(8)) | BigInt(b)
      }

      const { hashUsername, signature_pre } = await signPreRegistration(
        effectiveUsername,
        nonce
      )

      await preRegister(
        address,
        hashUsername as `0x${string}`,
        nonce,
        signature_pre as `0x${string}`,
        price as bigint
      )

      const signature_reg = await signRegistration(
        effectiveUsername,
        clowNumber,
        nonce
      )

      await register(
        address,
        effectiveUsername,
        clowNumber,
        nonce,
        signature_reg as `0x${string}`
      )

      setSuccess("Your EVVM name service was created.")
    } catch {
      setError("Something went wrong while creating your name service.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-card/50 hover:bg-card/60 border-2 border-chart-3 text-chart-3 font-mono text-sm h-12 rounded-lg shadow-[0_0_15px_rgba(var(--chart-3),0.3)] hover:shadow-[0_0_25px_rgba(var(--chart-3),0.5)] transition-all uppercase tracking-wider">
          🧬 Create EVVM Name
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider text-primary">
            Create EVVM Name
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">
            Choose a name and highlight your core skills to register your EVVM
            identity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
                setSuccess(null)
              }}
              placeholder="e.g. builder.evvm"
              className="w-full bg-card/20 border border-primary/30 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono transition-all"
            />
            {effectiveUsername && (
              <p className="text-xs font-mono">
                {isAvailabilityLoading ? (
                  <span className="text-muted-foreground">
                    Checking availability...
                  </span>
                ) : isAvailable ? (
                  <span className="text-green-500">Name is available</span>
                ) : (
                  <span className="text-destructive">
                    Name is not available
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Skills
            </label>
            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => {
                  const active = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 py-1 rounded-full border text-xs font-mono transition-all ${
                        active
                          ? "bg-chart-2/20 border-chart-2 text-chart-2 shadow-[0_0_10px_rgba(var(--chart-2),0.4)]"
                          : "bg-card/20 border-primary/20 text-muted-foreground hover:bg-card/30"
                      }`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-mono">
                No skills found in your profile.
              </p>
            )}
          </div>

          {priceLabel && (
            <p className="text-xs text-muted-foreground font-mono">
              Estimated registration fee: {priceLabel} ETH
            </p>
          )}

          {effectiveUsername && (
            <div className="mt-2 rounded-md bg-card/30 border border-primary/10 p-2">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">
                Debug (on-chain state)
              </p>
              <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(
                  {
                    username: effectiveUsername,
                    isAvailable,
                    exists,
                    owner,
                    loading: {
                      availability: isAvailabilityLoading,
                      exists: isExistsLoading,
                      owner: isOwnerLoading,
                    },
                    error: {
                      availability: isAvailabilityError,
                      exists: isExistsError,
                      owner: isOwnerError,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive font-mono">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-500 font-mono">{success}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!canSubmit}
            className="w-full bg-chart-2 hover:bg-chart-2/80 text-primary-foreground font-mono text-sm h-10 rounded-md shadow-[0_0_20px_rgba(var(--chart-2),0.4)] hover:shadow-[0_0_30px_rgba(var(--chart-2),0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isPrePending || isRegPending
              ? "Creating..."
              : "Create Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfilePage() {
  const { address } = useAccount()
  const { data, isLoading: isPoapLoading } = useGetAllPoapsByAddress()
  const { data: talentProtocolData, isLoading: isProfileLoading } =
    useGetProfileTalentProtocol()

  const profile = talentProtocolData?.profile
  const isLoading = isPoapLoading || isProfileLoading

  const avatars = [
    "/avatars/spr_cat_wcapsulebig_01.gif",
    "/avatars/spr_cat_wcapsulebig_02.gif",
    "/avatars/spr_cat_wcapsulebig_03.gif",
    "/avatars/spr_cat_wcapsulebig_04.gif",
    "/avatars/spr_cat_wcapsulebig_05.gif",
  ]

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0)

  const nextAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev + 1) % avatars.length)
  }

  const previousAvatar = () => {
    setCurrentAvatarIndex(
      (prev) => (prev - 1 + avatars.length) % avatars.length
    )
  }

  const formatIdentifier = (identifier?: string) => {
    if (identifier?.startsWith("0x")) {
      return `${identifier.slice(0, 6)}...${identifier.slice(-4)}`
    }
    return identifier
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/spr_catbig_background.png')" }}
      />

      {/* Content */}
      <div className="relative z-10 h-full ">
        {/* Header - Optimizado para móvil */}
        <header className="absolute top-0 right-0 p-2 h-14">
          <ConnectButton
            accountStatus={"avatar"}
            chainStatus={"none"}
            showBalance={false}
          />
        </header>

        <main className="px-2 space-y-4 max-w-2xl mx-auto h-dvh">
          <div className="flex flex-col justify-center items-center h-full">
            {/* Welcome Message */}
            <div className="mb-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-xs font-mono uppercase tracking-widest text-primary">
                  System Online
                </p>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome, Builder
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                <span className="text-chart-2">▸</span> Initializing your cypher
                identity...
              </p>
            </div>

            {isLoading ? (
              // Loading Skeleton
              <ProfileSkeleton />
            ) : (
              // Actual Content
              <>
                <div className="grid grid-cols-3 gap-1 place-content-center">
                  <div className="text-center w-full flex gap-2 items-center flex-col justify-center">
                    {/* Player Info Header */}
                    <div className="relative">
                      <h2 className="text-xl font-bold truncate px-2 text-primary animate-pulse">
                        {profile?.display_name || profile?.name || "PLAYER_001"}
                      </h2>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                    </div>

                    {profile?.location && (
                      <p className="text-xs text-chart-2 font-medium">
                        📍 {profile.location}
                      </p>
                    )}
                    {profile?.ens && (
                      <p className="text-xs text-primary font-bold break-all px-2 bg-primary/10 py-1 rounded">
                        {profile.ens}
                      </p>
                    )}

                    {/* Stats Panel */}
                    <div className="w-full space-y-2">
                      {profile?.rank_position && (
                        <div className="relative overflow-hidden rounded-lg bg-linear-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 border border-primary/30 p-3">
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                          <div className="relative flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                              <Zap className="h-5 w-5 text-primary animate-pulse" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Global Rank
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                #{profile.rank_position}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {profile?.onchain_since && (
                        <div className="px-3 py-2 bg-card/20 border border-border rounded-md">
                          <p className="text-[10px] text-chart-3 font-mono uppercase tracking-widest">
                            ⚡ ONCHAIN SINCE{" "}
                            {new Date(profile.onchain_since).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-card/20 border border-primary/20 rounded-md font-mono text-xs">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>

                    <img
                      src={avatars[currentAvatarIndex]}
                      alt="Profile Avatar"
                      className="h-full w object-cover mb-0"
                    />

                    <div className="flex gap-2">
                      {/* Avatar Navigation Arrows */}
                      <button
                        onClick={previousAvatar}
                        className="p-1 bg-card/10 hover:bg-card/20 border-2 border-primary text-primary rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all cursor-pointer"
                        aria-label="Previous avatar"
                      >
                        <ChevronLeft className="size-4" />
                      </button>

                      <button
                        onClick={nextAvatar}
                        className="p-1 bg-card/10 hover:bg-card/20 border-2 border-primary text-primary rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all cursor-pointer"
                        aria-label="Next avatar"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>

                    {profile?.bio && (
                      <p className="text-sm text-center text-muted-foreground line-clamp-3 px-2">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex gap-1.5 flex-wrap justify-center">
                      {profile?.main_role && (
                        <Badge variant="default" className="text-xs">
                          {profile.main_role.charAt(0).toUpperCase() +
                            profile.main_role.slice(1)}
                        </Badge>
                      )}
                      {profile?.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {profile?.tags && profile.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{profile.tags.length - 3}
                        </Badge>
                      )}
                      {profile?.human_checkmark && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-500 text-xs"
                        >
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {/* Connected Accounts */}
                    {profile?.accounts && profile.accounts.length > 0 && (
                      <div className="w-full space-y-1.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                          ⚡ Linked Accounts
                        </p>
                        {profile.accounts.slice(0, 3).map((account) => (
                          <div
                            key={account.identifier}
                            className="flex items-center gap-2 text-sm p-2 rounded bg-card/10 border border-primary/10 hover:border-primary/30 transition-colors min-w-0"
                          >
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 capitalize border-primary/30 text-primary"
                            >
                              {account.source}
                            </Badge>
                            <span className="text-muted-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono">
                              {formatIdentifier(account.username) ||
                                formatIdentifier(account.identifier)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full my-6">
                  {/* POAP Section - All in One */}
                  {!data || data.length === 0 ? (
                    <div className="flex items-center justify-center gap-3 py-6 text-center rounded-lg bg-card/80">
                      <div className="relative">
                        <Trophy className="h-8 w-8 text-muted-foreground/50" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/30 rounded-full animate-ping" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          No Achievements Yet
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          <span className="text-chart-2">▸</span> Attend
                          hackathons to unlock POAPs
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-lg bg-indigo-950/80 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary animate-pulse shrink-0" />
                          <p className="text-xs font-medium text-primary capitalize tracking-wide">
                            Achievement Gallery
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-mono text-muted-foreground">
                            Total:
                          </p>
                          <p className="text-lg font-medium text-chart-2">
                            {data.length}
                          </p>
                        </div>
                      </div>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-4 py-1">
                          {data.map((poap, index) => (
                            <div
                              key={poap.tokenId}
                              className="group relative flex flex-col items-center gap-2 transition-all active:scale-95 shrink-0"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="relative w-16 h-16">
                                <div className="absolute inset-0 bg-primary/20 rounded-full" />
                                <img
                                  src={poap.event.image_url}
                                  alt={poap.event.name}
                                  className="relative w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                              <a
                                href={poap.event.event_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary rounded-full p-2"
                                title={poap.event.name}
                              >
                                <ExternalLink className="h-3 w-3 text-primary-foreground" />
                              </a>
                            </div>
                          ))}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="bg-primary/10"
                        />
                      </ScrollArea>
                    </div>
                  )}

                  {/* POAP Section Skeleton */}
                  {isLoading && <PoapSkeleton />}
                </div>
              </>
            )}

            <div></div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Link
                  href={"/world"}
                  className="w-full flex justify-center items-center bg-card/50 hover:bg-card/60 border-2 border-primary text-primary font-mono text-sm h-12 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all uppercase tracking-wider px-4"
                >
                  🌍 Enter World
                </Link>

                <Link
                  href={"/events"}
                  className="w-full text-nowrap flex justify-center items-center bg-card/50 hover:bg-card/60 border-2 border-chart-2 text-chart-2 font-mono text-sm h-12 rounded-lg shadow-[0_0_15px_rgba(var(--chart-2),0.3)] hover:shadow-[0_0_25px_rgba(var(--chart-2),0.5)] transition-all uppercase tracking-wider px-4"
                >
                  🎯 Browse Events
                </Link>
              </div>

              <NameServiceDialog
                address={address}
                skills={profile?.tags || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
