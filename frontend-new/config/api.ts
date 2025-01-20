import { electionApi } from "@/services/api"
import { mockApi } from "@/services/mockApi"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export const api = USE_MOCK_API ? mockApi : electionApi