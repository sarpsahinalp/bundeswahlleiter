"use client"

import { useState } from "react"
import { getElectionResults } from "@/lib/mockData"
import ElectionChart from "./ElectionChart"

export default function ElectionResults() {
  const [selectedYear, setSelectedYear] = useState<number>(2021)
  const [selectedConstituency, setSelectedConstituency] = useState<string>("1")

  const electionResult2021 = getElectionResults(2021)
  const electionResult2017 = getElectionResults(2017)

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number.parseInt(event.target.value))
  }

  const handleConstituencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConstituency(event.target.value)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={2021}>2021</option>
          <option value={2017}>2017</option>
        </select>
        <select
          value={selectedConstituency}
          onChange={handleConstituencyChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {electionResult2021?.constituencies.map((constituency) => (
            <option key={constituency.id} value={constituency.id}>
              {constituency.name}
            </option>
          ))}
        </select>
      </div>
      <ElectionChart
        result2021={electionResult2021}
        result2017={electionResult2017}
        selectedConstituency={selectedConstituency}
      />
    </div>
  )
}

