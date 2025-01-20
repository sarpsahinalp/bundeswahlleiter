"use client"

import { useState } from "react"
import { useElection } from "@/contexts/ElectionContext"

export default function AdminPage() {
    const { isElectionActive, electionDate, setIsElectionActive, setElectionDate } = useElection()
    const [newDate, setNewDate] = useState(electionDate.toISOString().slice(0, -8))

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewDate(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setElectionDate(new Date(newDate))
    }

    // Use a consistent date format with explicit options
    const formatDate = (date: Date) => {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        })
    }

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-4">Election Admin Panel</h2>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Election Status</h3>
                    <button
                        onClick={() => setIsElectionActive(!isElectionActive)}
                        className={`px-4 py-2 rounded ${
                            isElectionActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                    >
                        {isElectionActive ? "Stop Election" : "Start Election"}
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Set Election Date and Time</h3>
                    <div className="flex items-center">
                        <input
                            type="datetime-local"
                            value={newDate}
                            onChange={handleDateChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Set Date
                        </button>
                    </div>
                </form>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Current Election Settings</h3>
                    <p>Status: {isElectionActive ? "Active" : "Inactive"}</p>
                    <p suppressHydrationWarning>Date: {formatDate(electionDate)}</p>
                </div>
            </div>
        </div>
    )
}

