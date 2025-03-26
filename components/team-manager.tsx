"use client"

import type React from "react"

import { useState } from "react"
import type { Team } from "@/lib/types"
import styles from "./team-manager.module.css"

interface TeamManagerProps {
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
}

export default function TeamManager({ teams, setTeams }: TeamManagerProps) {
  const [newTeamName, setNewTeamName] = useState("")
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingTeamName, setEditingTeamName] = useState("")

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return

    if (teams.some(item => item.name.toLowerCase() === newTeamName.toLowerCase())) return

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
    }

    setTeams([...teams, newTeam])
    setNewTeamName("")
  }

  const handleRemoveTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id))
  }

  const startEditingTeam = (team: Team) => {
    setEditingTeamId(team.id)
    setEditingTeamName(team.name)
  }

  const saveEditingTeam = () => {
    if (!editingTeamName.trim() || !editingTeamId) return

    setTeams(teams.map((team) => (team.id === editingTeamId ? { ...team, name: editingTeamName.trim() } : team)))

    setEditingTeamId(null)
    setEditingTeamName("")
  }

  const cancelEditingTeam = () => {
    setEditingTeamId(null)
    setEditingTeamName("")
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Equipos</h2>

      <div className={styles.addTeamForm}>
        <input
          type="text"
          placeholder="Nombre del equipo"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
          className={styles.input}
        />
        <button onClick={handleAddTeam} disabled={!newTeamName.trim()} className={styles.addButton}>
          Agregar
        </button>
      </div>

      {teams.length > 0 ? (
        <ul className={styles.teamList}>
          {teams.map((team) => (
            <li key={team.id} className={styles.teamItem}>
              {editingTeamId === team.id ? (
                <div className={styles.editForm}>
                  <input
                    type="text"
                    value={editingTeamName}
                    onChange={(e) => setEditingTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEditingTeam()}
                    className={styles.input}
                    autoFocus
                  />
                  <div className={styles.editButtons}>
                    <button onClick={saveEditingTeam} disabled={!editingTeamName.trim()} className={styles.saveButton}>
                      Guardar
                    </button>
                    <button onClick={cancelEditingTeam} className={styles.cancelButton}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className={styles.teamName}>{team.name}</span>
                  <div className={styles.teamActions}>
                    <button onClick={() => startEditingTeam(team)} className={styles.editButton}>
                      Editar
                    </button>
                    <button onClick={() => handleRemoveTeam(team.id)} className={styles.deleteButton}>
                      Borrar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>Aún no se han agregado equipos.</p>
      )}
    </div>
  )
}

