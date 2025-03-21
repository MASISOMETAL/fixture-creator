"use client"

import { useState, useEffect } from "react"
import type { Team, Match, StandingsEntry } from "@/lib/types"
import styles from "./tournament-fixture.module.css"

interface TournamentFixtureProps {
  teams: Team[]
}

export default function TournamentFixture({ teams }: TournamentFixtureProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<StandingsEntry[]>([])
  const [matchdays, setMatchdays] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<string>("standings")
  const [activeMatchday, setActiveMatchday] = useState<number>(1)

  useEffect(() => {
    if (teams.length < 2) return

    const generatedMatches: Match[] = []
    const totalRounds = teams.length - 1
    const matchesPerRound = Math.floor(teams.length / 2)

    const teamsCopy = [...teams]

    if (teams.length % 2 !== 0) {
      teamsCopy.push({ id: "bye", name: "BYE" })
    }

    for (let round = 0; round < totalRounds; round++) {
      for (let match = 0; match < matchesPerRound; match++) {

        if (teamsCopy[match].id !== "bye" && teamsCopy[teamsCopy.length - 1 - match].id !== "bye") {
          generatedMatches.push({
            id: `${round}-${match}`,
            homeTeamId: teamsCopy[match].id,
            awayTeamId: teamsCopy[teamsCopy.length - 1 - match].id,
            played: false,
            round: round,
            matchday: round + 1,
          })
        }
      }

      const firstTeam = teamsCopy[0]
      const lastTeam = teamsCopy[teamsCopy.length - 1]

      for (let i = teamsCopy.length - 1; i > 1; i--) {
        teamsCopy[i] = teamsCopy[i - 1]
      }

      teamsCopy[1] = lastTeam
    }

    setMatches(generatedMatches)

    const initialStandings: StandingsEntry[] = teams.map((team) => ({
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    }))

    setStandings(initialStandings)

    const uniqueMatchdays = Array.from(new Set(generatedMatches.map((match) => match.matchday))).sort((a, b) => a - b)
    setMatchdays(uniqueMatchdays)

    if (uniqueMatchdays.length > 0) {
      setActiveMatchday(uniqueMatchdays[0])
    }
  }, [teams])

  const updateMatchResult = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches((prevMatches) =>
      prevMatches.map((match) => (match.id === matchId ? { ...match, homeScore, awayScore, played: true } : match)),
    )

    const updatedMatch = matches.find((match) => match.id === matchId)
    if (!updatedMatch) return

    updateStandings(updatedMatch, homeScore, awayScore)
  }

  const updateStandings = (match: Match, homeScore: number, awayScore: number) => {
    setStandings((prevStandings) => {
      const newStandings = [...prevStandings]

      const homeTeamIndex = newStandings.findIndex((entry) => entry.teamId === match.homeTeamId)
      const awayTeamIndex = newStandings.findIndex((entry) => entry.teamId === match.awayTeamId)

      if (homeTeamIndex === -1 || awayTeamIndex === -1) return prevStandings

      // Dividir todo por dos, ya que los inputs duplican el resultado al ejecutarse dos veces
      if (match.played && match.homeScore !== undefined && match.awayScore !== undefined) {
        const homeTeam = newStandings[homeTeamIndex]
        const awayTeam = newStandings[awayTeamIndex]

        homeTeam.played -= 1 / 2
        awayTeam.played -= 1 / 2

        homeTeam.goalsFor -= match.homeScore / 2
        homeTeam.goalsAgainst -= match.awayScore / 2
        awayTeam.goalsFor -= match.awayScore / 2
        awayTeam.goalsAgainst -= match.homeScore / 2

        if (match.homeScore > match.awayScore) {
          homeTeam.won -= 1 / 2
          awayTeam.lost -= 1 / 2
          homeTeam.points -= 3 / 2
        } else if (match.homeScore < match.awayScore) {
          homeTeam.lost -= 1 / 2
          awayTeam.won -= 1 / 2
          awayTeam.points -= 3 / 2
        } else {
          homeTeam.drawn -= 1 / 2
          awayTeam.drawn -= 1 / 2
          homeTeam.points -= 1 / 2
          awayTeam.points -= 1 / 2
        }
      }

      newStandings[homeTeamIndex].played += 1 / 2
      newStandings[awayTeamIndex].played += 1 / 2

      newStandings[homeTeamIndex].goalsFor += homeScore / 2
      newStandings[homeTeamIndex].goalsAgainst += awayScore / 2
      newStandings[awayTeamIndex].goalsFor += awayScore / 2
      newStandings[awayTeamIndex].goalsAgainst += homeScore / 2

      if (homeScore > awayScore) {
        newStandings[homeTeamIndex].won += 1 / 2
        newStandings[awayTeamIndex].lost += 1 / 2
        newStandings[homeTeamIndex].points += 3 / 2
      } else if (homeScore < awayScore) {
        newStandings[homeTeamIndex].lost += 1 / 2
        newStandings[awayTeamIndex].won += 1 / 2
        newStandings[awayTeamIndex].points += 3 / 2
      } else {
        newStandings[homeTeamIndex].drawn += 1 / 2
        newStandings[awayTeamIndex].drawn += 1 / 2
        newStandings[homeTeamIndex].points += 1 / 2
        newStandings[awayTeamIndex].points += 1 / 2
      }

      return newStandings.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points

        const aGoalDiff = a.goalsFor - a.goalsAgainst
        const bGoalDiff = b.goalsFor - b.goalsAgainst

        if (aGoalDiff !== bGoalDiff) return bGoalDiff - aGoalDiff

        return b.goalsFor - a.goalsFor
      })
    })
  }

  const getTeamName = (teamId: string) => {
    const team = teams.find((team) => team.id === teamId)
    return team ? team.name : "Unknown Team"
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "standings" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("standings")}
        >
          Tabla
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "fixtures" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("fixtures")}
        >
          Fixtures
        </button>
      </div>

      {activeTab === "standings" && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Tabla de posiciones</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Equipo</th>
                  <th className={styles.centered}>PJ</th>
                  <th className={styles.centered}>G</th>
                  <th className={styles.centered}>E</th>
                  <th className={styles.centered}>P</th>
                  <th className={styles.centered}>GF</th>
                  <th className={styles.centered}>GC</th>
                  <th className={styles.centered}>GT</th>
                  <th className={styles.centered}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry, index) => (getTeamName(entry.teamId) !== "Libre" &&
                  <tr key={entry.teamId}>
                    <td>{index + 1}</td>
                    <td className={styles.teamName}>{getTeamName(entry.teamId)}</td>
                    <td className={styles.centered}>{entry.played}</td>
                    <td className={styles.centered}>{entry.won}</td>
                    <td className={styles.centered}>{entry.drawn}</td>
                    <td className={styles.centered}>{entry.lost}</td>
                    <td className={styles.centered}>{entry.goalsFor}</td>
                    <td className={styles.centered}>{entry.goalsAgainst}</td>
                    <td className={styles.centered}>{entry.goalsFor - entry.goalsAgainst}</td>
                    <td className={`${styles.centered} ${styles.points}`}>{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "fixtures" && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Calendario</h3>

          <div className={styles.matchdayTabs}>
            {matchdays.map((matchday) => (
              <button
                key={matchday}
                className={`${styles.matchdayTab} ${activeMatchday === matchday ? styles.activeMatchdayTab : ""}`}
                onClick={() => setActiveMatchday(matchday)}
              >
                Fecha {matchday}
              </button>
            ))}
          </div>

          <div className={styles.matchList}>
            {matches
              .filter((match) => match.matchday === activeMatchday)
              .map((match) => {

                const homeTeamName = getTeamName(match.homeTeamId);
                const awayTeamName = getTeamName(match.awayTeamId);

                if (homeTeamName === "Libre") return <span key={match.id} className={styles.teamLibre}>{getTeamName(match.awayTeamId)} Esta Libre</span>;

                if (awayTeamName === "Libre") return <span key={match.id} className={styles.teamLibre}>{getTeamName(match.homeTeamId)} Esta Libre</span>;
                return (
                  <div key={match.id} className={styles.matchItem}>
                    <div className={styles.teamHome}>
                      <span className={styles.teamName}>{getTeamName(match.homeTeamId)}</span>
                    </div>

                    <div className={styles.scoreContainer}>
                      <input
                        type="number"
                        min="0"
                        className={styles.scoreInput}
                        value={match.homeScore !== undefined ? match.homeScore : ""}
                        onChange={(e) => {
                          const homeScore = Number.parseInt(e.target.value) || 0
                          const awayScore = match.awayScore !== undefined ? match.awayScore : 0
                          updateMatchResult(match.id, homeScore, awayScore)
                        }}
                      />
                      <span className={styles.scoreSeparator}>-</span>
                      <input
                        type="number"
                        min="0"
                        className={styles.scoreInput}
                        value={match.awayScore !== undefined ? match.awayScore : ""}
                        onChange={(e) => {
                          const awayScore = Number.parseInt(e.target.value) || 0
                          const homeScore = match.homeScore !== undefined ? match.homeScore : 0
                          updateMatchResult(match.id, homeScore, awayScore)
                        }}
                      />
                    </div>

                    <div className={styles.teamAway}>
                      <span className={styles.teamName}>{getTeamName(match.awayTeamId)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

