"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import {mockApi} from "@/services/mockApi";
import { electionApi } from "@/services/api";

type ElectionContextType = {
    isElectionActive: boolean
    electionStartTime: Date
    refreshElectionStatus: () => Promise<void>
}

const ElectionContext = createContext<ElectionContextType>({
    isElectionActive: false,
    electionStartTime: new Date(),
    refreshElectionStatus: async () => {},
})

export const useElection = () => {
    const context = useContext(ElectionContext)
    if (context === undefined) {
        throw new Error("useElection must be used within an ElectionProvider")
    }
    return context
}

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isElectionActive, setIsElectionActive] = useState(false)
    const [electionStartTime, setElectionStartTime] = useState<Date>(new Date())

    const fetchElectionStatus = async () => {
        try {
            const status = await electionApi.getElectionStatus()
            setIsElectionActive(status.status === "ACTIVE")
            setElectionStartTime(status.startTime ? new Date(status.startTime) : new Date())
        } catch (error) {
            console.error("Error fetching election status:", error)
            setElectionStartTime(new Date()) // Set a default date in case of error
        }
    }

    useEffect(() => {
        fetchElectionStatus()
        const interval = setInterval(fetchElectionStatus, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [])

    return (
        <ElectionContext.Provider
            value={{ isElectionActive, electionStartTime, refreshElectionStatus: fetchElectionStatus }}
        >
            {children}
        </ElectionContext.Provider>
    )
}

