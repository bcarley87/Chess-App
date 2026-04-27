"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const LEVELS = [
  { label: "Beginner", min: 400, max: 800, color: "#5a9e5a", emoji: "🌱" },
  { label: "Novice", min: 800, max: 1200, color: "#4a9eff", emoji: "📘" },
  { label: "Intermediate", min: 1200, max: 1500, color: "#c9a45a", emoji: "⚡" },
  { label: "Advanced", min: 1500, max: 1800, color: "#c95a5a", emoji: "🔥" },
  { label: "Expert", min: 1800, max: 2200, color: "#9b59b6", emoji: "👑" },
]

const THEMES = [
  { id: "fork", label: "Fork", emoji: "⚔️", desc: "Win material by attacking two pieces at once" },
  { id: "pin", label: "Pin", emoji: "📌", desc: "Restrict a piece that shields a more valuable one" },
  { id: "mateIn1", label: "Mate in 1", emoji: "💀", desc: "Deliver checkmate in one move" },
  { id: "mateIn2", label: "Mate in 2", emoji: "⚡", desc: "Force checkmate in two moves" },
  { id: "mateIn3", label: "Mate in 3", emoji: "🎯", desc: "Calculate a three-move mating sequence" },
  { id: "sacrifice", label: "Sacrifice", emoji: "♟️", desc: "Give up material for a decisive advantage" },
  { id: "backRankMate", label: "Back Rank", emoji: "🏰", desc: "Exploit an undefended back rank" },
  { id: "endgame", label: "Endgame", emoji: "🕰️", desc: "Convert a winning endgame position" },
]

export default function PuzzleSetSelector() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(LEVELS.map((l) => l.label)))
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set())

  function toggleLevel(label: string) {
    setSelectedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(label)) { if (next.size > 1) next.delete(label) }
      else next.add(label)
      return next
    })
  }

  function toggleTheme(id: string) {
    setSelectedThemes((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function start() {
    const activeLevels = LEVELS.filter((l) => selectedLevels.has(l.label))
    const minRating = Math.min(...activeLevels.map((l) => l.min))
    const maxRating = Math.max(...activeLevels.map((l) => l.max))
    const themeParam = selectedThemes.size > 0 ? `&themes=${[...selectedThemes].join(",")}` : ""
    router.push(`/puzzle/next?min=${minRating}&max=${maxRating}${themeParam}`)
  }

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Custom Puzzle Set</h2>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ background: "none", border: "1px solid #404040", color: "#a0a0a0", padding: "0.375rem 0.875rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}
        >
          {open ? "▲ Hide" : "▼ Configure"}
        </button>
      </div>

      {open && (
        <div style={{ background: "#262626", border: "1px solid #404040", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Difficulty */}
          <div>
            <div style={{ color: "#a0a0a0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>
              Difficulty Levels
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {LEVELS.map((lvl) => {
                const on = selectedLevels.has(lvl.label)
                return (
                  <button
                    key={lvl.label}
                    onClick={() => toggleLevel(lvl.label)}
                    style={{
                      padding: "0.5rem 0.875rem",
                      borderRadius: "8px",
                      border: `2px solid ${on ? lvl.color : "#404040"}`,
                      background: on ? lvl.color + "22" : "transparent",
                      color: on ? lvl.color : "#666",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      transition: "all 0.15s",
                    }}
                  >
                    {lvl.emoji} {lvl.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Themes */}
          <div>
            <div style={{ color: "#a0a0a0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>
              Puzzle Themes <span style={{ color: "#555", fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>(leave blank for all)</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.625rem" }}>
              {THEMES.map((t) => {
                const on = selectedThemes.has(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTheme(t.id)}
                    title={t.desc}
                    style={{
                      padding: "0.625rem 0.875rem",
                      borderRadius: "8px",
                      border: `2px solid ${on ? "#4a9eff" : "#404040"}`,
                      background: on ? "#4a9eff22" : "transparent",
                      color: on ? "#4a9eff" : "#888",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.emoji} {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Summary + Start */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ color: "#666", fontSize: "0.875rem" }}>
              {[...selectedLevels].join(", ")}
              {selectedThemes.size > 0 && ` · ${[...selectedThemes].map((id) => THEMES.find((t) => t.id === id)?.label).join(", ")}`}
            </div>
            <button
              onClick={start}
              style={{
                padding: "0.75rem 2rem",
                background: "#7fa650",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Start Custom Set →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
