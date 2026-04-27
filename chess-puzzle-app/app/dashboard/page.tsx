import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { signOut } from "@/auth"
import PuzzleSetSelector from "./PuzzleSetSelector"

const LEVELS = [
  { label: "Beginner", min: 400, max: 800, color: "#5a9e5a", emoji: "🌱" },
  { label: "Novice", min: 800, max: 1200, color: "#4a9eff", emoji: "📘" },
  { label: "Intermediate", min: 1200, max: 1500, color: "#c9a45a", emoji: "⚡" },
  { label: "Advanced", min: 1500, max: 1800, color: "#c95a5a", emoji: "🔥" },
  { label: "Expert", min: 1800, max: 2200, color: "#9b59b6", emoji: "👑" },
]

function ratingToLevel(rating: number) {
  return LEVELS.find((l) => rating >= l.min && rating < l.max) ?? LEVELS[LEVELS.length - 1]
}

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const [user, stats, recentProgress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.puzzleProgress.findMany({
      where: { userId },
      include: { puzzle: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ])

  const rating = user?.puzzleRating ?? 800
  const level = ratingToLevel(rating)
  const totalSolved = stats?.totalSolved ?? 0
  const streak = stats?.streak ?? 0
  const accuracy = stats && stats.totalAttempts > 0
    ? Math.round((stats.totalSolved / stats.totalAttempts) * 100)
    : 0

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", color: "#e8e8e8" }}>
      {/* Nav */}
      <nav style={{ background: "#262626", borderBottom: "1px solid #404040", padding: "0 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "800", fontSize: "1.25rem" }}>
            <span>♟</span> Chess Puzzles
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
              {session.user.name ?? session.user.email}
            </span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}>
              <button type="submit" style={{ background: "none", border: "1px solid #404040", color: "#a0a0a0", padding: "0.375rem 0.875rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        {/* Welcome + Rating */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ ...cardStyle, gridColumn: "span 2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: level.color + "33", border: `3px solid ${level.color}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
              }}>
                {level.emoji}
              </div>
              <div>
                <div style={{ color: "#a0a0a0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>Puzzle Rating</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "800", color: level.color, lineHeight: 1 }}>{rating}</div>
                <div style={{ color: level.color, fontSize: "0.875rem", fontWeight: "600" }}>{level.label}</div>
              </div>
            </div>
          </div>
          <StatCard label="Puzzles Solved" value={totalSolved} icon="🧩" />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" />
          <StatCard label="Current Streak" value={`${streak} days`} icon="🔥" />
          <StatCard label="Best Streak" value={`${stats?.bestStreak ?? 0} days`} icon="⭐" />
        </div>

        {/* Custom Puzzle Set */}
        <PuzzleSetSelector />

        {/* Quick Difficulty Selector */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Quick Start by Difficulty</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {LEVELS.map((lvl) => (
            <Link
              key={lvl.label}
              href={`/puzzle/next?min=${lvl.min}&max=${lvl.max}`}
              style={{
                ...cardStyle,
                textAlign: "center",
                textDecoration: "none",
                border: `1px solid ${lvl.color}44`,
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{lvl.emoji}</div>
              <div style={{ color: lvl.color, fontWeight: "700", fontSize: "0.95rem" }}>{lvl.label}</div>
              <div style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.25rem" }}>{lvl.min}–{lvl.max}</div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        {recentProgress.length > 0 && (
          <>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Recent Puzzles</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {recentProgress.map((p) => (
                <Link
                  key={p.id}
                  href={`/puzzle/${p.puzzleId}`}
                  style={{ ...cardStyle, textDecoration: "none" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{p.solved ? "✅" : "❌"}</span>
                    <span style={{ color: "#666", fontSize: "0.75rem" }}>Rating {p.puzzle.rating}</span>
                  </div>
                  <div style={{ color: "#e8e8e8", fontSize: "0.875rem", fontWeight: "600" }}>
                    {p.puzzle.title ?? "Tactics Puzzle"}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {p.puzzle.themes.slice(0, 2).join(", ")}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>{icon}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#e8e8e8" }}>{value}</div>
      <div style={{ color: "#a0a0a0", fontSize: "0.8rem" }}>{label}</div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: "#262626",
  border: "1px solid #404040",
  borderRadius: "12px",
  padding: "1.25rem",
}
