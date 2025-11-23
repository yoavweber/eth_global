import { appConfig } from "@/env-config"
import { makeApiUrl } from "./config"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"

export const backendBasePath = {
  production: "https://api.example.com",
  development: "http://localhost:4000",
  local: "http://localhost:4000",
} as const

export const externalBackendBasePath = {
  poap: "https://api.poap.tech",
  talent_protocol: "https://api.talentprotocol.com/",
}

export const prefix = "/api"

export const makeBasePath = (environment: string, hasPrefix = true) => {
  const env = environment.trim() as keyof typeof backendBasePath
  const resolvedPrefix = hasPrefix ? prefix : undefined

  switch (env) {
    case "production":
      return makeApiUrl(backendBasePath.production, resolvedPrefix)
    case "development":
      return makeApiUrl(backendBasePath.development, resolvedPrefix)
    case "local":
      return makeApiUrl(backendBasePath.local, resolvedPrefix)

    default:
      return makeApiUrl(backendBasePath.development, resolvedPrefix)
  }
}

// Default API instance for internal backend
export const appAPI = axios.create({
  baseURL: makeBasePath(appConfig.environment),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Generic request that can use either internal or external API
export const genericRequest = async (
  method: "get" | "post" | "put" | "delete" | "patch",
  path: string,
  data?: Record<string, unknown> | unknown[],
  options?: AxiosRequestConfig & {
    baseURL?: string // Optional external API base URL
    useCredentials?: boolean // Whether to include credentials
  }
) => {
  const { baseURL, useCredentials, ...axiosOptions } = options || {}

  // Use external API if baseURL is provided, otherwise use internal API
  const apiInstance = baseURL
    ? axios.create({
        baseURL,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...axiosOptions.headers, // Merge custom headers
        },
      })
    : appAPI

  const response = await apiInstance({
    method,
    url: path,
    params: method === "get" ? data : undefined,
    data: method !== "get" ? data : undefined,
    withCredentials: useCredentials ?? !baseURL, // Default: credentials only for internal API
    ...axiosOptions,
  })

  return response.data
}

// Backward compatibility - Request to fetch data from internal backend
export const genericAuthRequest = async (
  method: "get" | "post" | "put" | "delete" | "patch",
  path: string,
  data?: Record<string, unknown> | unknown[],
  options?: AxiosRequestConfig & {
    baseURL?: string
    useCredentials?: boolean
  }
) => {
  return genericRequest(method, path, data, options)
}

type AppQueryProps<T> = {
  fetcher: () => Promise<T>
  queryKey: unknown[] // string | number | object
  options?: Omit<
    UseQueryOptions<T, ApiErrorResponse, T, unknown[]>,
    | "queryKey"
    | "queryFn"
    | "initialData"
    | "retry"
    | "refetchOnWindowFocus"
    | "staleTime"
  >
}

export const useAppQuery = <T>({
  fetcher,
  queryKey,
  options,
}: AppQueryProps<T | null>) => {
  const query = useQuery({
    queryKey: queryKey.filter((x) => x), // remove empty values
    queryFn: async () => {
      try {
        return await fetcher()
      } catch (error) {
        if (error instanceof AxiosError) {
          if (
            error.response?.status === 404 &&
            error.response.statusText === "Not Found"
          ) {
            return null
          }
        }

        throw error
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1 * 1000 * 60, // 1 minutes
    ...options,
  })

  // Logs, debugging stuff
  if (query.error) {
    console.error("Query failed:", query.error)
  }

  return query
}

export type ApiErrorResponse = { response: { data: { error_message: string } } }

type AppMutation<PayloadRequest, VResponse, ErrorType = ApiErrorResponse> = {
  fetcher: (data: PayloadRequest) => Promise<VResponse>
  options?: UseMutationOptions<VResponse, ErrorType, PayloadRequest, unknown[]>
}

export const useAppMutation = <
  PayloadRequest,
  TResponse,
  TGenericError = ApiErrorResponse
>({
  fetcher,
  options,
}: AppMutation<PayloadRequest, TResponse, TGenericError>) => {
  const mutation = useMutation<
    TResponse,
    TGenericError,
    PayloadRequest,
    unknown[]
  >({
    mutationFn: (data) => fetcher(data),
    ...options,
  })

  // Logs, debugging stuff
  if (mutation.isError) {
    console.error("Mutation failed:", mutation.error)
  }

  return mutation
}
