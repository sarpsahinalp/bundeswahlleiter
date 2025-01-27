"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

type ElectionContextType = {
    isElectionActive: boolean
    electionDate: Date
    setIsElectionActive: (active: boolean) => void
    setElectionDate: (date: Date) => void
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined)

export const useElection = () => {
    const context = useContext(ElectionContext)
    if (context === undefined) {
        throw new Error("useElection must be used within an ElectionProvider")
    }
    return context
}

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isElectionActive, setIsElectionActive] = useState(false)
    const [electionDate, setElectionDate] = useState(new Date("2025-09-01T08:00:00"))

    useEffect(() => {
        // Load state from localStorage on component mount
        const storedIsActive = localStorage.getItem("isElectionActive")
        const storedDate = localStorage.getItem("electionDate")

        if (storedIsActive) setIsElectionActive(JSON.parse(storedIsActive))
        if (storedDate) setElectionDate(new Date(storedDate))
    }, [])

    useEffect(() => {
        // Save state to localStorage whenever it changes
        localStorage.setItem("isElectionActive", JSON.stringify(isElectionActive))
        localStorage.setItem("electionDate", electionDate.toISOString())
    }, [isElectionActive, electionDate])

    return (
        <ElectionContext.Provider value={{ isElectionActive, electionDate, setIsElectionActive, setElectionDate }}>
            {children}
        </ElectionContext.Provider>
    )
}

