export interface Vote {
  constituencyId: string
  firstVote: string
  secondVote: string
}

export interface ConstituencyResult {
  id: string
  name: string
  firstVotes: { [party: string]: number }
  secondVotes: { [party: string]: number }
}

export interface ElectionResult {
  year: number
  constituencies: ConstituencyResult[]
}

const parties = ["CDU/CSU", "SPD", "AfD", "FDP", "LINKE", "GRÜNE", "Other"]

function generateRandomVotes(total: number): { [party: string]: number } {
  const votes: { [party: string]: number } = {}
  let remaining = total

  parties.forEach((party, index) => {
    if (index === parties.length - 1) {
      votes[party] = remaining
    } else {
      const partyVotes = Math.floor(Math.random() * remaining)
      votes[party] = partyVotes
      remaining -= partyVotes
    }
  })

  return votes
}

function generateConstituencyResult(id: string, year: number): ConstituencyResult {
  const totalVotes = 100000 + Math.floor(Math.random() * 50000)
  return {
    id,
    name: `Constituency ${id}`,
    firstVotes: generateRandomVotes(totalVotes),
    secondVotes: generateRandomVotes(totalVotes),
  }
}

export const mockElectionResults: ElectionResult[] = [
  {
    year: 2017,
    constituencies: Array.from({ length: 299 }, (_, i) => generateConstituencyResult((i + 1).toString(), 2017)),
  },
  {
    year: 2021,
    constituencies: Array.from({ length: 299 }, (_, i) => generateConstituencyResult((i + 1).toString(), 2021)),
  },
]

export function getElectionResults(year: number): ElectionResult | undefined {
  return mockElectionResults.find((result) => result.year === year)
}

export function getConstituencyResult(year: number, constituencyId: string): ConstituencyResult | undefined {
  const electionResult = getElectionResults(year)
  return electionResult?.constituencies.find((constituency) => constituency.id === constituencyId)
}

