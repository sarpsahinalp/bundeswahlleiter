"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import withAuth, { type WahlkreisInfo } from "@/lib/RequiresAuth"
import type { ErstestimmeOptionen, ZweitestimmeOptionen } from "@/models/vote/token/models"
import api from "@/lib/axios"

interface VotingInterfaceProps {
  wahlkreisInfo: WahlkreisInfo
}

function VotingInterface({ wahlkreisInfo }: VotingInterfaceProps) {
  const [erststimme, setErststimme] = useState<number>(-1)
  const [zweitstimme, setZweitstimme] = useState<number>(-1)
  const [wahlkreis, setWahlkreis] = useState<WahlkreisInfo>(wahlkreisInfo)
  const [erststimmeOptions, setErststimmeOptions] = useState<ErstestimmeOptionen[]>([])
  const [zweitstimmeOptions, setZweitstimmeOptions] = useState<ZweitestimmeOptionen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [erstRes, zweitRes] = await Promise.all([
          api.get("/secure/vote/erstestimme"),
          api.get("/secure/vote/zweitestimme"),
        ])

        setErststimmeOptions(erstRes.data)
        setZweitstimmeOptions(zweitRes.data)
        setWahlkreis(wahlkreisInfo)
      } catch (err) {
        setError("Failed to load voting options. Please try again.")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [wahlkreisInfo]) // Added wahlkreisInfo to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (erststimme === -1 && zweitstimme === -1) {
      const confirmBlankVote = window.confirm("You haven't selected any options. Do you want to submit a blank vote?")
      if (!confirmBlankVote) {
        return
      }
    }

    try {
      await api.post("/secure/submit/vote", {
        erststimme: erststimme,
        zweitstimme: zweitstimme,
      })
      router.push("/vote/confirmation")
    } catch (err) {
      console.error("Vote submission failed:", err)
      setError("Failed to submit vote. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-5xl mx-auto text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Group zweitstimme options by party
  const groupedParties = zweitstimmeOptions.reduce(
    (acc, candidate) => {
      const key = candidate.kurzbezeichnung
      if (!acc[key]) {
        acc[key] = {
          kurzbezeichnung: key,
          name: candidate.name,
          partei_id: candidate.partei_id,
          candidates: [],
        }
      }
      acc[key].candidates.push(`${candidate.vorname} ${candidate.nachname}`)
      return acc
    },
    {} as Record<string, { kurzbezeichnung: string; name: string; partei_id: number; candidates: string[] }>,
  )

  console.log("Erststimme options:", erststimmeOptions)

  return (
    <div className="max-w-5xl mx-auto bg-white p-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Stimmzettel</h1>
          <p className="text-base mb-1">
            für die Wahl zum Deutschen Bundestag im Wahlkreis {wahlkreis.id} {wahlkreis.name}
          </p>
          <p className="text-base mb-6">
            am{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>

          <div className="text-xl font-bold mb-4">
            Sie haben 2 Stimmen
            <div className="flex justify-center items-center mt-2 space-x-32">
              <div className="flex items-center">
                <div className="w-16 h-0.5 bg-black"></div>
                <ChevronDown className="w-6 h-6 -ml-3" />
              </div>
              <div className="flex items-center">
                <div className="w-16 h-0.5 bg-blue-600"></div>
                <ChevronDown className="w-6 h-6 -ml-3 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Voting Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Erststimme (Left Column) */}
          <div className="border-r border-gray-200 pr-4">
            <div className="text-center mb-6">
              <p className="font-bold">hier 1 Stimme</p>
              <p className="text-sm">für die Wahl</p>
              <p className="text-sm mb-2">eines/einer Wahlkreisabgeordneten</p>
              <p className="font-bold">Erststimme</p>
            </div>

            <div className="space-y-2">
              {erststimmeOptions.map((candidate) => (
                <div
                  key={candidate.partei_id}
                  className="flex items-start space-x-3 p-3 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setErststimme((prevState) => (prevState === candidate.partei_id ? -1 : candidate.partei_id))
                  }
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${erststimme === candidate.partei_id ? "border-black" : "border-gray-300"}`}
                    >
                      {erststimme === candidate.partei_id && <div className="w-4 h-4 rounded-full bg-black" />}
                    </div>
                  </div>
                  <div className="flex-grow flex justify-between items-start">
                    <div>
                      <div className="font-bold">
                        {candidate.titel} {candidate.nachname}, {candidate.vorname}
                      </div>
                      <div className="text-sm text-gray-600">
                        {candidate.beruf}
                        <br />
                        {candidate.wohnort}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {candidate.partyKurzbezeichnung?.startsWith("EB") ? "" : candidate.partyKurzbezeichnung}
                      </div>
                      <div className="text-sm">{candidate.partyName || candidate.partyKurzbezeichnung}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zweitstimme (Right Column) */}
          <div className="pl-4">
            <div className="text-center mb-6">
              <p className="font-bold text-blue-600">hier 1 Stimme</p>
              <p className="text-sm">für die Wahl einer Landesliste (Partei)</p>
              <p className="text-sm text-gray-600 mb-2">
                – maßgebende Stimme für die Verteilung der
                <br />
                Sitze insgesamt auf die einzelnen Parteien –
              </p>
              <p className="font-bold text-blue-600">Zweitstimme</p>
            </div>

            <div className="space-y-2">
              {Object.values(groupedParties).map((party) => (
                <div
                  key={party.partei_id}
                  className="flex items-start space-x-3 p-3 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => setZweitstimme((prevState) => (prevState === party.partei_id ? -1 : party.partei_id))}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${zweitstimme === party.partei_id ? "border-blue-600" : "border-gray-300"}`}
                    >
                      {zweitstimme === party.partei_id && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div>
                      <span className="font-bold text-blue-600">{party.kurzbezeichnung}</span>
                      <br />
                      <span className="text-sm text-blue-700">{party.name}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {party.candidates.map((candidate, idx) => (
                        <div key={idx}>{candidate}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-all duration-200"
          >
            Submit Vote
          </button>
        </div>
      </form>
    </div>
  )
}

export default withAuth(VotingInterface)

