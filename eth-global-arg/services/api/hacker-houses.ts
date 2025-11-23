import { BASE_CACHE_KEYS } from "@/constants/query-cache"
import { genericAuthRequest, useAppQuery } from "../base"

export const useGetAllHackerHouses = () => {
  return useAppQuery<unknown>({
    fetcher: async () =>
      await genericAuthRequest("get", `/search`, {
        city: "San Francisco",
        checkInDate: "2024-07-01",
        checkOutDate: "2025-12-31",
        bedrooms: 3,
      }),
    queryKey: [BASE_CACHE_KEYS.getHackerHouses],
  })
}
