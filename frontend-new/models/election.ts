export interface Election {
    id: number
    year: number
    startDate: Date
    endDate: Date
    isActive: boolean
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

