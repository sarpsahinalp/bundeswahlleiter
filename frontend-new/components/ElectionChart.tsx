"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ElectionResult } from "@/lib/mockData"

interface ElectionChartProps {
  result2021: ElectionResult | undefined
  result2017: ElectionResult | undefined
  selectedConstituency: string
}

export default function ElectionChart({ result2021, result2017, selectedConstituency }: ElectionChartProps) {
  if (!result2021 || !result2017) return null

  const constituency2021 = result2021.constituencies.find((c) => c.id === selectedConstituency)
  const constituency2017 = result2017.constituencies.find((c) => c.id === selectedConstituency)

  if (!constituency2021 || !constituency2017) return null

  const chartData = Object.keys(constituency2021.secondVotes).map((party) => ({
    name: party,
    "2021": constituency2021.secondVotes[party],
    "2017": constituency2017.secondVotes[party],
  }))

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="2021" fill="#8884d8" />
          <Bar dataKey="2017" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

