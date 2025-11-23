import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http } from "wagmi"
import { mainnet, sonic } from "wagmi/chains"
import { appConfig } from "./env-config"

// Suppress WalletConnect analytics errors
if (typeof window !== "undefined") {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const url =
      typeof args[0] === "string"
        ? args[0]
        : args[0] instanceof Request
        ? args[0].url
        : args[0] instanceof URL
        ? args[0].toString()
        : "";
    if (url.includes("pulse.walletconnect.org")) {
      return new Response(null, { status: 200 })
    }
    return originalFetch(...args)
  }
}

export const sonicTestnet = {
  id: 14601,
  name: "Sonic Testnet",
  nativeCurrency: { name: "Sonic", symbol: "S", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.soniclabs.com"] },
    public: { http: ["https://rpc.testnet.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "SonicScan (Testnet)",
      url: "https://testnet.sonicscan.org",
    },
  },
} as const

export const wagmiConfig = getDefaultConfig({
  appName: "Mi dApp",
  projectId: appConfig.PROJECT_ID,
  chains: [mainnet, sonic, sonicTestnet],
  transports: {
    [mainnet.id]: http(),
    [sonic.id]: http(),
    [sonicTestnet.id]: http(sonicTestnet.rpcUrls.default.http[0]),
  },
  ssr: true,
  // Analytics option removed as it's not supported
})
