'use client'

import ElectionTimer from "@/components/ElectionTimer"
import LiveAnalysis from "@/components/LiveAnalysis"
import { electionApi } from "@/services/api"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const[registeredVoters, setRegisteredVoters] = useState<number>(0)
    const[turnout, setTurnout] = useState<number>(0)
    const[isElectionActive, setIsElectionActive] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            const currentElection = await electionApi.getCurrentElection()

            console.log(currentElection)
            
            if (!currentElection) return
            setRegisteredVoters(currentElection.totalVotes)
            setIsElectionActive(currentElection.status === "ACTIVE")

            const liveResults = await electionApi.getLiveResults()

            setTurnout(liveResults.totalVotes / currentElection.totalVotes * 100)

        }

        fetchData().then()
    }, [])

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-4">Election Dashboard</h2>
            <div className="space-y-8">
                <ElectionTimer />
                
                {isElectionActive && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium">Voter Turnout</h3>
                            <p className="mt-1 text-3xl font-semibold">{turnout}%</p>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium">Registered Voters</h3>
                            <p className="mt-1 text-3xl font-semibold">{(registeredVoters / 1000000.0).toFixed(2)} millionen</p>
                        </div>
                    </div>
                </div>)}

                <LiveAnalysis />
            </div>
        </div>
    )
}

