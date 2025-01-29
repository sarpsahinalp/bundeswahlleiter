export interface Election {
    id: number
    startTime: Date
    year: number
    status: string
    totalVotes: number
}

export interface Vote {
    id: number
    constituencyId: string
    firstVote: string
    secondVote: string
    timestamp: Date
}

export interface Constituency {
    id: string
    name: string
    state: string
    totalVoters: number
}

export interface PartyResult {
    party: string
    wahlkreis: string
    firstVotes: number
    secondVotes: number
    seats: number
    percentage: number
}

export interface ConstituencyResult {
    constituencyId: string
    constituencyName: string
    winner: string
    firstVotes: { [party: string]: number }
    secondVotes: { [party: string]: number }
    turnout: number
}

export interface OverhangSeat {
    party: string
    state: string
    seats: number
}

