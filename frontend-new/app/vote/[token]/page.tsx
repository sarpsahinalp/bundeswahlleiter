"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

interface Candidate {
  id: number
  name: string
  occupation: string
  city: string
  party: string
  partyFull: string
}

interface Party {
  id: number
  name: string
  fullName: string
  candidates: string[]
}

const candidates: Candidate[] = [
  {
    id: 1,
    name: "Dr. Westerwelle, Angelika",
    occupation: "Unternehmerin",
    city: "Bielefeld",
    party: "CDU",
    partyFull: "Christlich Demokratische Union Deutschlands",
  },
  {
    id: 2,
    name: "Dr. Esdar, Wiebke",
    occupation: "Diplom-Psychologin",
    city: "Bielefeld",
    party: "SPD",
    partyFull: "Sozialdemokratische Partei Deutschlands",
  },
  {
    id: 3,
    name: "Schlifter-de la Fontaine, Jan Maik",
    occupation: "Unternehmer",
    city: "Bielefeld",
    party: "FDP",
    partyFull: "Freie Demokratische Partei",
  },
  {
    id: 4,
    name: "Kneller, Maximilian",
    occupation: "Wissenschaftlicher Mitarbeiter",
    city: "Bielefeld",
    party: "AfD",
    partyFull: "Alternative für Deutschland",
  },
  {
    id: 5,
    name: "Haßelmann, Britta",
    occupation: "Diplom-Sozialarbeiterin",
    city: "Bielefeld",
    party: "GRÜNE",
    partyFull: "BÜNDNIS 90/DIE GRÜNEN",
  },
  {
    id: 6,
    name: "Straetmanns, Friedrich",
    occupation: "Bundestagsabgeordneter",
    city: "Bielefeld",
    party: "DIE LINKE",
    partyFull: "DIE LINKE",
  },
]

const parties: Party[] = [
  {
    id: 1,
    name: "CDU",
    fullName: "Christlich Demokratische Union Deutschlands",
    candidates: ["Armin Laschet", "Anja Karliczek", "Ralph Brinkhaus", "Jens Spahn", "Elisabeth Winkelmeier-Becker"],
  },
  {
    id: 2,
    name: "SPD",
    fullName: "Sozialdemokratische Partei Deutschlands",
    candidates: ["Dr. Rolf Mützenich", "Svenja Schulze", "Sebastian Hartmann", "Kerstin Griese", "Dirk Wiese"],
  },
  {
    id: 3,
    name: "FDP",
    fullName: "Freie Demokratische Partei",
    candidates: [
      "Christian Lindner",
      "Dr. Marie-Agnes Strack-Zimmermann",
      "Alexander Graf Lambsdorff",
      "Dr. Marco Buschmann",
    ],
  },
  {
    id: 4,
    name: "AfD",
    fullName: "Alternative für Deutschland",
    candidates: ["Rüdiger Lucassen", "Dr. Martin Vincentz", "Matthias Helferich"],
  },
  {
    id: 5,
    name: "GRÜNE",
    fullName: "BÜNDNIS 90/DIE GRÜNEN",
    candidates: ["Mona Neubaur", "Felix Banaszak", "Sven Lehmann", "Irene Mihalic"],
  },
  {
    id: 6,
    name: "DIE LINKE",
    fullName: "DIE LINKE",
    candidates: ["Dr. Sahra Wagenknecht", "Sevim Dagdelen", "Nina Eumann"],
  },
]

export default function VotingInterface({ params }: { params: { token: string } }) {
  const [erststimme, setErststimme] = useState("")
  const [zweitstimme, setZweitstimme] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Vote submitted:", { erststimme, zweitstimme })
    router.push("/vote/confirmation")
  }

  return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h1 className="text-2xl font-bold text-center">Stimmzettel</h1>
              <p className="text-center text-gray-600 mt-2">
                für die Wahl zum Deutschen Bundestag im Wahlkreis 132 Bielefeld
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
                    {candidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className={`p-4 rounded-lg border ${
                                erststimme === candidate.party
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <label className="flex items-start space-x-4 cursor-pointer">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                  className={`w-6 h-6 rounded-full border-2 ${
                                      erststimme === candidate.party ? "border-black" : "border-gray-300"
                                  } flex items-center justify-center`}
                              >
                                {erststimme === candidate.party && <div className="w-4 h-4 rounded-full bg-black" />}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <input
                                  type="radio"
                                  name="erststimme"
                                  value={candidate.party}
                                  checked={erststimme === candidate.party}
                                  onChange={(e) => setErststimme(e.target.value)}
                                  className="sr-only"
                              />
                              <div className="font-bold">{candidate.name}</div>
                              <div className="text-sm text-gray-600">
                                {candidate.occupation}
                                <br />
                                {candidate.city}
                              </div>
                              <div className="mt-1">
                                <span className="font-bold">{candidate.party}</span>
                                <br />
                                <span className="text-sm">{candidate.partyFull}</span>
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
                    {parties.map((party) => (
                        <div
                            key={party.id}
                            className={`p-4 rounded-lg border ${
                                zweitstimme === party.name
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <label className="flex items-start space-x-4 cursor-pointer">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                  className={`w-6 h-6 rounded-full border-2 ${
                                      zweitstimme === party.name ? "border-blue-600" : "border-gray-300"
                                  } flex items-center justify-center`}
                              >
                                {zweitstimme === party.name && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <input
                                  type="radio"
                                  name="zweitstimme"
                                  value={party.name}
                                  checked={zweitstimme === party.name}
                                  onChange={(e) => setZweitstimme(e.target.value)}
                                  className="sr-only"
                              />
                              <div>
                                <span className="font-bold text-blue-600">{party.name}</span>
                                <br />
                                <span className="text-sm">{party.fullName}</span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                {party.candidates.map((candidate, index) => (
                                    <div key={index}>{candidate}</div>
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

