import api from "../lib/axios"
import type { Election, Vote, PartyResult, ConstituencyResult } from "@/models/election"
import {
    Bundesland, KnappsteSieger,
    Mandat,
    Sitzverteilung,
    UberhangMandate,
    Wahlkreis,
    WahlkreisSieger,
    WahlkreisUebersicht
} from "@/models/models"

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
    getSeatDistribution: async (year: number): Promise<Sitzverteilung[]> => {
        try {
            const response = await api.get<Sitzverteilung[]>(`/ergebnisse/sitzverteilung/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching seat distribution:", error)
            return []
        }
    },

    getParliamentMembers: async (year: number, bundesland_id: number): Promise<Mandat[]> => {
        try {
            const response = await api.get<Mandat[]>(`/ergebnisse/bundestagsmitglieder/${year}/${bundesland_id}`)
            return response.data
        } catch (error) {
            console.error("Error fetching parliament members:", error)
            return []
        }
    },

    getConstituencyOverview: async (year: number, wahlkreis_id: number, useAggregation: boolean): Promise<WahlkreisUebersicht> => {
        try {
            const response = await api.get<WahlkreisUebersicht>(`/ergebnisse/wahlkreis/uebersicht/${year}/${wahlkreis_id}/${useAggregation}`)
            return response.data
        } catch (error) {
            console.error("Error fetching constituency overview:", error)
            return null
        }
    },

    getConstituencyWinners: async (year: number): Promise<WahlkreisSieger[]> => {
        try {
            const response = await api.get<WahlkreisSieger[]>(`/ergebnisse/wahlkreisSieger/${year}`)
            return response.data
        } catch (error) {
            console.error("Error fetching constituency winners:", error)
            return []
        }
    },

    getOverhangSeats: async (year: number, grouping: string): Promise<UberhangMandate[]> => {
        try {
            const response = await api.get<UberhangMandate[]>(`/ergebnisse/ueberhangmandate/${year}/${grouping}`)
            return response.data
        } catch (error) {
            console.error("Error fetching overhang seats:", error)
            return []
        }
    },

    getClosestResults: async (year: number): Promise<KnappsteSieger[]> => {
        try {
            const response = await api.get<KnappsteSieger[]>(`/ergebnisse/knappsteSieger/${year}`)
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

    // Auswahldaten

    getAllConstituencies: async (): Promise<Wahlkreis[]> => {
        try {
            const response = await api.get<Wahlkreis[]>('/ergebnisse/wahlkreise')
            return response.data;
        } catch (error) {
            console.error('Error fetching Wahlkreise:', error);
            throw error;
        }
    },

    getAllBundeslander: async (): Promise<Bundesland[]> => {
        try {
            const response = await api.get<Bundesland[]>(`/ergebnisse/bundeslander`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Bundesländer:', error);
            throw error;
        }
    },

    getJahre: async (): Promise<number[]> => {
        try {
            const response = await api.get<number[]>(`/ergebnisse/jahre`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Bundesländer:', error);
            throw error;
        }
    }
}

