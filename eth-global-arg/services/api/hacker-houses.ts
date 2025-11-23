import { BASE_CACHE_KEYS } from "@/constants/query-cache"
import { genericAuthRequest, useAppQuery } from "../base"
import { HackerHousesResponse } from "@/types/hacker-houses"

type filters = Partial<{
  city: string
  checkInDate: string
  checkOutDate: string
  bedrooms: number
}>

export const useGetAllHackerHouses = (filters: filters) => {
  return useAppQuery<HackerHousesResponse>({
    fetcher: async () => await genericAuthRequest("get", `/search`, filters),
    queryKey: [BASE_CACHE_KEYS.getHackerHouses, filters],
  })
}
