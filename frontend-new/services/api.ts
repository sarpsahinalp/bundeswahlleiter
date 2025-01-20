import api from "../lib/axios"
import type { Election, Vote, PartyResult, ConstituencyResult, OverhangSeat } from "@/models/election"

export const electionApi = {
    // Election management
    getCurrentElection: async () => {
        try {
            const response = await api.get<Election>("/elections/current")
            return response.data
        } catch (error) {
            console.error("Error fetching current election:", error)
            return null
        }
    },

    updateElectionStatus: async (id: number, isActive: boolean) => {
        try {
            const response = await api.patch<Election>(`/elections/${id}`, { isActive })
            return response.data
        } catch (error) {
            console.error("Error updating election status:", error)
            throw error
        }
    },

    // Voting
    submitVote: async (vote: Omit<Vote, "id" | "timestamp">) => {
        try {
            const response = await api.post<Vote>("/votes", vote)
            return response.data
        } catch (error) {
            console.error("Error submitting vote:", error)
            throw error
        }
    },

    // Analysis endpoints
    getSeatDistribution: async (year: number) => {
        try {
            const response = await api.get<PartyResult[]>(`/analysis/seats/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching seat distribution:", error)
            return []
        }
    },

    getParliamentMembers: async (year: number) => {
        try {
            const response = await api.get<any[]>(`/analysis/members/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching parliament members:", error)
            return []
        }
    },

    getConstituencyOverview: async (year: number, constituencyId: string) => {
        try {
            const response = await api.get<ConstituencyResult>(`/analysis/constituencies/${year}/${constituencyId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching constituency overview:", error)
            return null
        }
    },

    getConstituencyWinners: async (year: number) => {
        try {
            const response = await api.get<ConstituencyResult[]>(`/analysis/winners/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching constituency winners:", error)
            return []
        }
    },

    getOverhangSeats: async (year: number) => {
        try {
            const response = await api.get<OverhangSeat[]>(`/analysis/overhang/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching overhang seats:", error)
            return []
        }
    },

    getClosestResults: async (year: number) => {
        try {
            const response = await api.get<ConstituencyResult[]>(`/analysis/closest/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching closest results:", error)
            return []
        }
    },

    getConstituencyDetails: async (year: number, constituencyId: string) => {
        try {
            const response = await api.get<ConstituencyResult>(`/analysis/details/${year}/${constituencyId}`)
            return response.data
        } catch (error) {
            console.error("Error fetching constituency details:", error)
            return null
        }
    },

    getLiveResults: async () => {
        try {
            const response = await api.get<{
                firstVotes: PartyResult[]
                secondVotes: PartyResult[]
                totalVotes: number
            }>("/analysis/live")
            return response.data
        } catch (error) {
            console.error("Error fetching live results:", error)
            return { firstVotes: [], secondVotes: [], totalVotes: 0 }
        }
    },
}

