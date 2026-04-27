"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), { ssr: false })

type Puzzle = {
  id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
  title: string | null
}

type Props = {
  puzzle: Puzzle
  userRating: number
  previouslySolved: boolean
}

const LEVELS = [
  { label: "Beginner", min: 400, max: 800 },
  { label: "Novice", min: 800, max: 1200 },
  { label: "Intermediate", min: 1200, max: 1500 },
  { label: "Advanced", min: 1500, max: 1800 },
  { label: "Expert", min: 1800, max: 2200 },
]

function ratingLabel(r: number) {
  return LEVELS.find((l) => r >= l.min && r < l.max)?.label ?? "Expert"
}

export default function PuzzleClient({ puzzle, userRating, previouslySolved }: Props) {
  const router = useRouter()
  const [result, setResult] = useState<{ solved: boolean; ratingDiff: number; newRating: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timerActive, setTimerActive] = useState(true)

  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  async function handleSolve(solved: boolean, timeSpent: number) {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const res = await fetch(`/api/puzzles/${puzzle.id}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solved, timeSpent }),
    })
    const data = await res.json()
    setResult({ solved, ratingDiff: data.ratingDiff, newRating: data.newRating })
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`
  }

  const diffLabel = ratingLabel(puzzle.rating)

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", color: "#e8e8e8" }}>
      {/* Nav */}
      <nav style={{ background: "#262626", borderBottom: "1px solid #404040", padding: "0 1.5rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ color: "#7fa650", fontWeight: "700", fontSize: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ← Dashboard
        </Link>
        <span style={{ fontWeight: "800" }}>♟ Chess Puzzles</span>
        <span style={{ color: "#a0a0a0", fontSize: "0.875rem" }}>Rating: {userRating}</span>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem", display: "grid", gridTemplateColumns: "minmax(0, 560px) 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Board */}
        <div>
          <PuzzleBoard puzzle={puzzle} onSolve={handleSolve} />
        </div>

        {/* Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Puzzle info */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                  {puzzle.title ?? "Tactics Puzzle"}
                </h2>
                <div style={{ color: "#a0a0a0", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {diffLabel} · Rating {puzzle.rating}
                </div>
              </div>
              {previouslySolved && (
                <span style={{ background: "#1a3a1a", color: "#7fa650", padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "600" }}>
                  ✓ Solved
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {puzzle.themes.slice(0, 4).map((t) => (
                <span key={t} style={{ background: "#383838", color: "#a0a0a0", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem" }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1, background: "#1a1a1a", borderRadius: "8px", padding: "0.75rem", textAlign: "center" }}>
                <div style={{ color: timerActive ? "#4a9eff" : "#666", fontSize: "1.5rem", fontWeight: "700", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(elapsed)}
                </div>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>Time</div>
              </div>
              <div style={{ flex: 1, background: "#1a1a1a", borderRadius: "8px", padding: "0.75rem", textAlign: "center" }}>
                <div style={{ color: "#e8e8e8", fontSize: "1.5rem", fontWeight: "700" }}>{puzzle.moves.length}</div>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>Moves</div>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div style={{
              ...cardStyle,
              border: `2px solid ${result.solved ? "#7fa650" : "#c95a5a"}`,
              background: result.solved ? "#1a2a1a" : "#2a1a1a",
            }}>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                  {result.solved ? "🎉" : "💪"}
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: result.solved ? "#7fa650" : "#c95a5a" }}>
                  {result.solved ? "Puzzle Solved!" : "Keep Practicing!"}
                </div>
                <div style={{ color: "#a0a0a0", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Rating: {result.newRating}
                  <span style={{ marginLeft: "0.5rem", color: result.ratingDiff >= 0 ? "#7fa650" : "#c95a5a", fontWeight: "600" }}>
                    ({result.ratingDiff >= 0 ? "+" : ""}{result.ratingDiff})
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  onClick={() => router.push(`/puzzle/next?min=${puzzle.rating - 200}&max=${puzzle.rating + 200}`)}
                  style={{ flex: 1, padding: "0.75rem", background: "#7fa650", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                >
                  Next Puzzle →
                </button>
                <Link href="/dashboard" style={{ flex: 1, padding: "0.75rem", background: "#2d2d2d", border: "1px solid #404040", borderRadius: "8px", color: "#e8e8e8", fontWeight: "600", textAlign: "center", textDecoration: "none" }}>
                  Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Tip */}
          {!result && (
            <div style={{ ...cardStyle, background: "#1e2a1e" }}>
              <div style={{ color: "#7fa650", fontWeight: "600", fontSize: "0.875rem", marginBottom: "0.5rem" }}>💡 Tip</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.875rem", lineHeight: "1.6" }}>
                Find the best move for {puzzle.fen.includes(" b ") ? "Black" : "White"}. Look for checks, captures, and threats.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: "#262626",
  border: "1px solid #404040",
  borderRadius: "12px",
  padding: "1.25rem",
}
