"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const parties = [
  { id: "cdu", name: "CDU/CSU", candidate: "Friedrich Merz" },
  { id: "spd", name: "SPD", candidate: "Olaf Scholz" },
  { id: "afd", name: "AfD", candidate: "Alice Weidel" },
  { id: "fdp", name: "FDP", candidate: "Christian Lindner" },
  { id: "linke", name: "LINKE", candidate: "Janine Wissler" },
  { id: "gruene", name: "GRÜNE", candidate: "Annalena Baerbock" },
  { id: "other", name: "Other", candidate: "Independent Candidate" },
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

  const CandidateCard = ({
    partyId,
    name,
    candidate,
    selected,
    onClick,
  }: {
    partyId: string
    name: string
    candidate: string
    selected: boolean
    onClick: () => void
  }) => (
    <div className="flex-1 min-w-[250px] max-w-[300px]">
      <button
        type="button"
        onClick={onClick}
        className={`w-full p-4 rounded-lg transition-all duration-200 ${
          selected
            ? "bg-blue-50 ring-2 ring-blue-500 ring-offset-2"
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-32 h-32 border-2 border-gray-300">
            <Image
              src={`/placeholder.svg?height=128&width=128`}
              alt={`Candidate ${candidate}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{candidate}</div>
            <div className="text-sm text-gray-600">{name}</div>
          </div>
          <div
            className={`w-8 h-8 rounded-full border-2 ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
          >
            {selected && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Cast Your Vote</h2>
      <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700">Important Information</h3>
          <p className="text-gray-600">
            You may choose to leave either or both votes empty. An empty vote is valid and will be counted as an
            abstention.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Erststimme (First Vote)</h3>
            <p className="text-center mb-6 text-gray-600">
              Select your candidate for direct mandate
              {erststimme && (
                <button
                  type="button"
                  onClick={() => setErststimme("")}
                  className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Clear selection
                </button>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parties.map((party) => (
                <CandidateCard
                  key={`first-${party.id}`}
                  partyId={party.id}
                  name={party.name}
                  candidate={party.candidate}
                  selected={erststimme === party.id}
                  onClick={() => setErststimme(party.id)}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Zweitstimme (Second Vote)</h3>
            <p className="text-center mb-6 text-gray-600">
              Select your party vote
              {zweitstimme && (
                <button
                  type="button"
                  onClick={() => setZweitstimme("")}
                  className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Clear selection
                </button>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parties.map((party) => (
                <CandidateCard
                  key={`second-${party.id}`}
                  partyId={party.id}
                  name={party.name}
                  candidate={party.candidate}
                  selected={zweitstimme === party.id}
                  onClick={() => setZweitstimme(party.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center text-gray-600">
              {!erststimme && !zweitstimme
                ? "You haven't made any selections. Submitting will count as a complete abstention."
                : !erststimme
                  ? "You haven't selected a candidate for your first vote. It will be counted as an abstention."
                  : !zweitstimme
                    ? "You haven't selected a party for your second vote. It will be counted as an abstention."
                    : "You have made selections for both votes."}
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-300 transform hover:scale-105 text-lg"
              type="submit"
            >
              Submit Vote
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

