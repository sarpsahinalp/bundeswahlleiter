import type { Election, Vote, PartyResult } from "@/models/election"

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockApi = {
    getCurrentElection: async () => {
        await delay(500)
        return {
            id: 1,
            year: 2025,
            startDate: new Date("2025-09-01T08:00:00"),
            endDate: new Date("2025-09-01T18:00:00"),
            isActive: true,
        } as Election
    },

    updateElectionStatus: async (id: number, isActive: boolean) => {
        await delay(500)
        return {
            id,
            year: 2025,
            startDate: new Date("2025-09-01T08:00:00"),
            endDate: new Date("2025-09-01T18:00:00"),
            isActive,
        } as Election
    },

    submitVote: async (vote: Omit<Vote, "id" | "timestamp">) => {
        await delay(500)
        return {
            ...vote,
            id: Math.floor(Math.random() * 1000000),
            timestamp: new Date(),
        } as Vote
    },

    getSeatDistribution: async (year: number) => {
        await delay(500)
        return [
            { party: "CDU/CSU", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 197 : 246, percentage: 30.2 },
            { party: "SPD", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 206 : 153, percentage: 25.7 },
            { party: "AfD", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 83 : 94, percentage: 10.3 },
            { party: "FDP", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 92 : 80, percentage: 11.5 },
            { party: "Die Linke", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 39 : 69, percentage: 4.9 },
            { party: "Grüne", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 118 : 67, percentage: 14.8 },
            { party: "Other", firstVotes: 0, secondVotes: 0, seats: year === 2021 ? 1 : 2, percentage: 2.6 },
        ] as PartyResult[]
    },

    // Add more mock implementations as needed...
}

