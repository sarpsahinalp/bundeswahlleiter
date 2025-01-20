"use client"

import { useState, useEffect } from "react"
import { useElection } from "@/contexts/ElectionContext"

export default function ElectionTimer() {
  const [timeLeft, setTimeLeft] = useState("")
  const { isElectionActive, electionDate } = useElection()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = electionDate.getTime() - now.getTime()

      if (difference > 0 && isElectionActive) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (isElectionActive) {
        setTimeLeft("Election Day!")
      } else {
        setTimeLeft("Election is not active")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isElectionActive, electionDate])

  return (
      <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium">Time until next election</h3>
          <p className="mt-1 text-3xl font-semibold animate-pulse">{timeLeft}</p>
          <p className="mt-2 text-sm text-gray-500" suppressHydrationWarning>
            Election date:{" "}
            {electionDate.toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>
  )
}

