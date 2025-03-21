"use client"

import { useState } from "react"
import TeamManager from "@/components/team-manager"
import TournamentFixture from "@/components/tournament-fixture"
import PlayoffBracket from "@/components/playoff-bracket"
import type { Team } from "@/lib/types"
import Tabs from "@/components/ui/tabs"
import styles from "./page.module.css"

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([])
  const [mode, setMode] = useState<"tournament" | "playoff">("tournament")
  const [fixtureCreated, setFixtureCreated] = useState(false)
  const [activeTab, setActiveTab] = useState("teams")

  const handleCreateFixture = () => {
    if (teams.length < 2) return

    let updatedTeams = [...teams];

    if (updatedTeams.length % 2 !== 0) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: "Libre"
      }
      updatedTeams.push(newTeam);
    }

    for (let i = 0; i < updatedTeams.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));

      [updatedTeams[i], updatedTeams[j]] = [updatedTeams[j], updatedTeams[i]];
    }
    setTeams(updatedTeams)

    setFixtureCreated(true)
  }

  const handleResetFixture = () => {
    setFixtureCreated(false)
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Fixture Creator</h1>

      {!fixtureCreated ? (
        <div className={styles.setupContainer}>
          <Tabs
            tabs={[
              { id: "teams", label: "Gestionar Equipos" },
              { id: "settings", label: "Configuración" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "teams" && <TeamManager teams={teams} setTeams={setTeams} />}

          {activeTab === "settings" && (
            <div className={styles.settingsCard}>
              <h2 className={styles.cardTitle}>Configuración de Fixture</h2>
              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel}>Tipo de Torneo</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === "tournament"}
                      onChange={() => setMode("tournament")}
                      className={styles.radioInput}
                    />
                    <span>Formato Liga (Round Robin)</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === "playoff"}
                      onChange={() => setMode("playoff")}
                      className={styles.radioInput}
                    />
                    <span>Playoff (Eliminación)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonContainer}>
            <button onClick={handleCreateFixture} disabled={teams.length < 2} className={styles.primaryButton}>
              Crear Fixture
            </button>
          </div>

          {teams.length < 2 && <p className={styles.helperText}>Añade al menos 2 equipos para crear un partido</p>}
        </div>
      ) : (
        <div className={styles.fixtureContainer}>
          <div className={styles.fixtureHeader}>
            <h2 className={styles.fixtureTitle}>{mode === "tournament" ? "Torneo" : "Playoff"} Fixture</h2>
            <button onClick={handleResetFixture} className={styles.resetButton}>
              Resetear Fixture
            </button>
          </div>

          {mode === "tournament" ? <TournamentFixture teams={teams} /> : <PlayoffBracket teams={teams} />}
        </div>
      )}
    </main>
  )
}

