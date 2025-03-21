"use client"

import { useState, useEffect } from "react"
import type { Team, PlayoffMatch } from "@/lib/types"
import styles from "./playoff-bracket.module.css"

interface PlayoffBracketProps {
  teams: Team[]
}

export default function PlayoffBracket({ teams }: PlayoffBracketProps) {
  const [rounds, setRounds] = useState<PlayoffMatch[][]>([])
  const [roundNames, setRoundNames] = useState<string[]>([])

  useEffect(() => {
    if (teams.length < 2) return

    const numTeams = teams.length
    const numRounds = Math.ceil(Math.log2(numTeams))
    const totalTeams = Math.pow(2, numRounds)

    const names = generateRoundNames(numRounds)
    setRoundNames(names)

    const allRounds: PlayoffMatch[][] = []

    const finalRound: PlayoffMatch[] = [{ id: `${numRounds - 1}-0`, round: numRounds - 1, position: 0 }]

    for (let round = numRounds - 2; round >= 0; round--) {
      const numMatches = Math.pow(2, numRounds - round - 1)
      const roundMatches: PlayoffMatch[] = []

      for (let position = 0; position < numMatches; position++) {
        roundMatches.push({
          id: `${round}-${position}`,
          round,
          position,
        })
      }

      allRounds.unshift(roundMatches)
    }

    allRounds.push(finalRound)

    const firstRound = [...allRounds[0]]
    const shuffledTeams = [...teams]

    while (shuffledTeams.length < totalTeams / 2) {
      shuffledTeams.push({ id: `bye-${shuffledTeams.length}`, name: "BYE" })
    }

    for (let i = 0; i < firstRound.length; i++) {
      firstRound[i].teamA = shuffledTeams[i * 2]?.id
      firstRound[i].teamB = shuffledTeams[i * 2 + 1]?.id

      if (firstRound[i].teamA?.startsWith("bye-")) {
        firstRound[i].winner = firstRound[i].teamB
      } else if (firstRound[i].teamB?.startsWith("bye-")) {
        firstRound[i].winner = firstRound[i].teamA
      }
    }

    allRounds[0] = firstRound
    setRounds(allRounds)
  }, [teams])

  const generateRoundNames = (numRounds: number): string[] => {
    const names: string[] = []

    for (let i = 0; i < numRounds; i++) {
      const roundNumber = numRounds - i

      if (roundNumber === 1) {
        names.push("Final")
      } else if (roundNumber === 2) {
        names.push("Semi Final")
      } else if (roundNumber === 3) {
        names.push("Cuartos de Final")
      } else if (roundNumber === 4) {
        names.push("Ronda de 16")
      } else if (roundNumber === 5) {
        names.push("Ronda de 32")
      } else {
        names.push(`Ronda de ${i + 1}`)
      }
    }

    return names
  }

  const getTeamName = (teamId?: string) => {
    if (!teamId) return "Ganador"
    if (teamId.startsWith("bye-")) return "BYE"

    const team = teams.find((team) => team.id === teamId)
    return team ? team.name : "Unknown Team"
  }

  const selectWinner = (match: PlayoffMatch, teamId: string) => {
    if (!teamId || teamId.startsWith("bye-")) return

    const updatedRounds = [...rounds]
    const roundIndex = updatedRounds.findIndex((round) => round.some((m) => m.id === match.id))

    if (roundIndex === -1) return

    const matchIndex = updatedRounds[roundIndex].findIndex((m) => m.id === match.id)
    updatedRounds[roundIndex][matchIndex].winner = teamId

    if (roundIndex < updatedRounds.length - 1) {
      const nextRoundIndex = roundIndex + 1
      const nextMatchPosition = Math.floor(match.position / 2)
      const nextMatchIndex = updatedRounds[nextRoundIndex].findIndex((m) => m.position === nextMatchPosition)

      if (nextMatchIndex !== -1) {
        if (match.position % 2 === 0) {
          updatedRounds[nextRoundIndex][nextMatchIndex].teamA = teamId
        } else {
          updatedRounds[nextRoundIndex][nextMatchIndex].teamB = teamId
        }

        if (updatedRounds[nextRoundIndex][nextMatchIndex].winner) {
          updatedRounds[nextRoundIndex][nextMatchIndex].winner = undefined
        }
      }
    }

    setRounds(updatedRounds)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {rounds.length > 0 && rounds[rounds.length - 1][0].winner && (
          <div className={styles.champion}>
            <h3 className={styles.championTitle}>Campeon</h3>
            <div className={styles.championName}>{getTeamName(rounds[rounds.length - 1][0].winner)}</div>
          </div>
        )}
        <h3 className={styles.cardTitle}>Llave de Playoff</h3>
        <div className={styles.bracketContainer}>
          {rounds.map((round, roundIndex) => (
            <div key={roundIndex} className={styles.round}>
              <h4 className={styles.roundTitle}>{roundNames[roundIndex]}</h4>

              <div className={styles.matchesContainer}>
                {round.map((match, matchIndex) => (
                  <div
                    key={match.id}
                    className={styles.matchItem}
                    style={{
                      marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 2}rem` : 0,
                      marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 2}rem` : 0,
                    }}
                  >
                    <div
                      className={`${styles.team} ${match.winner === match.teamA
                          ? styles.winnerTeam
                          : match.teamA?.startsWith("bye-")
                            ? styles.byeTeam
                            : ""
                        }`}
                      onClick={() => match.teamA && selectWinner(match, match.teamA)}
                    >
                      {getTeamName(match.teamA)}
                    </div>

                    <div className={styles.versus}>vs</div>

                    <div
                      className={`${styles.team} ${match.winner === match.teamB
                          ? styles.winnerTeam
                          : match.teamB?.startsWith("bye-")
                            ? styles.byeTeam
                            : ""
                        }`}
                      onClick={() => match.teamB && selectWinner(match, match.teamB)}
                    >
                      {getTeamName(match.teamB)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

