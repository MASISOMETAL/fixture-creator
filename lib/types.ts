export interface Team {
  id: string
  name: string
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore?: number
  awayScore?: number
  played: boolean
  round: number
  matchday: number
}

export interface StandingsEntry {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface PlayoffMatch {
  id: string
  round: number
  position: number
  teamA?: string
  teamB?: string
  winner?: string
}

