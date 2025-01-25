"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import withAuth, {WahlkreisInfo} from "@/lib/RequiresAuth"
import { ErstestimmeOptionen, ZweitestimmeOptionen } from "@/models/vote/token/models"
import api from "@/lib/axios";

interface VotingInterfaceProps {
    wahlkreisInfo: WahlkreisInfo
}

function VotingInterface( { wahlkreisInfo }: VotingInterfaceProps ) {
  const [erststimme, setErststimme] = useState<number>(-1)
  const [zweitstimme, setZweitstimme] = useState<number>(-1)
  const [wahlkreis, setWahlkreis] = useState<WahlkreisInfo>(wahlkreisInfo)
  const [erststimmeOptions, setErststimmeOptions] = useState<ErstestimmeOptionen[]>([])
  const [zweitstimmeOptions, setZweitstimmeOptions] = useState<ZweitestimmeOptionen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  console.log('Prop sent in?', wahlkreis)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [erstRes, zweitRes] = await Promise.all([
          api.get("/secure/vote/erstestimme"),
          api.get("/secure/vote/zweitestimme"),
            // api.get("/secure/")
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
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/secure/submit/vote',
          {
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

  // Group zweitstimme options by party kurzbezeichnung
  const groupedParties = zweitstimmeOptions.reduce((acc, candidate) => {
    const key = candidate.kurzbezeichnung
    if (!acc[key]) {
      acc[key] = {
        name: key,
        partei_id: candidate.partei_id,
        candidates: []
      }
    }
    acc[key].candidates.push(`${candidate.vorname} ${candidate.nachname}`)
    return acc
  }, {} as Record<string, { name: string; partei_id: number; candidates: string[] }>)

  return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h1 className="text-2xl font-bold text-center">Stimmzettel</h1>
              <p className="text-center text-gray-600 mt-2">
                für die Wahl zum Deutschen Bundestag im Wahlkreis {wahlkreis.id} {wahlkreis.name}
              </p>
              <div className="text-center font-bold text-xl mt-4">
                Sie haben 2 Stimmen
                <div className="flex justify-center items-center mt-2 space-x-8">
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

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Erststimme (Left Column) */}
                <div className="border-r border-gray-200">
                  <div className="text-center mb-4">
                    <h2 className="font-bold text-lg">hier 1 Stimme</h2>
                    <p className="text-sm text-gray-600">für die Wahl eines/einer Wahlkreisabgeordneten</p>
                    <p className="font-bold mt-2">Erststimme</p>
                  </div>
                  <div className="space-y-4">
                    {erststimmeOptions.map((candidate, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                                erststimme === candidate.partei_id
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <label className="flex items-start space-x-4 cursor-pointer">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                  className={`w-6 h-6 rounded-full border-2 ${
                                      erststimme === candidate.partei_id ? "border-black" : "border-gray-300"
                                  } flex items-center justify-center`}
                              >
                                {erststimme === candidate.partei_id && <div className="w-4 h-4 rounded-full bg-black" />}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <input
                                  type="radio"
                                  name="erststimme"
                                  value={candidate.partei_id}
                                  checked={erststimme === candidate.partei_id}
                                  onChange={(e) => setErststimme(Number(e.target.value))}
                                  className="sr-only"
                              />
                              <div className="font-bold">{`${candidate.vorname} ${candidate.nachname}`}</div>
                              <div className="mt-1">
                                <span className="font-bold">{candidate.kurzbezeichnung}</span>
                              </div>
                            </div>
                          </label>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Zweitstimme (Right Column) */}
                <div>
                  <div className="text-center mb-4">
                    <h2 className="font-bold text-lg text-blue-600">hier 1 Stimme</h2>
                    <p className="text-sm text-gray-600">für die Wahl einer Landesliste (Partei)</p>
                    <p className="font-bold mt-2 text-blue-600">Zweitstimme</p>
                  </div>
                  <div className="space-y-4">
                    {Object.values(groupedParties).map((party, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                                zweitstimme === party.partei_id
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <label className="flex items-start space-x-4 cursor-pointer">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                  className={`w-6 h-6 rounded-full border-2 ${
                                      zweitstimme === party.partei_id ? "border-blue-600" : "border-gray-300"
                                  } flex items-center justify-center`}
                              >
                                {zweitstimme === party.partei_id && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <input
                                  type="radio"
                                  name="zweitstimme"
                                  value={party.partei_id}
                                  checked={zweitstimme === party.partei_id}
                                  onChange={(e) => setZweitstimme(Number(e.target.value))}
                                  className="sr-only"
                              />
                              <div>
                                <span className="font-bold text-blue-600">{party.name}</span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                {party.candidates.map((candidate, idx) => (
                                    <div key={idx}>{candidate}</div>
                                ))}
                              </div>
                            </div>
                          </label>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-300 text-lg"
                >
                  Submit Vote
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}

export default withAuth(VotingInterface)