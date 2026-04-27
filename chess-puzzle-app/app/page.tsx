import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a1a 0%, #0d1f0d 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <div style={{ fontSize: "80px", marginBottom: "1rem" }}>♟</div>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "800",
          color: "#e8e8e8",
          marginBottom: "0.5rem",
          letterSpacing: "-1px",
        }}>
          Chess Puzzles
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#a0a0a0", marginBottom: "2.5rem" }}>
          Sharpen your tactics. Train like a champion.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "0.875rem 2.5rem",
            background: "#7fa650",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "1rem",
            textDecoration: "none",
            transition: "background 0.2s",
          }}>
            Log In
          </Link>
          <Link href="/register" style={{
            padding: "0.875rem 2.5rem",
            background: "transparent",
            color: "#e8e8e8",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "1rem",
            textDecoration: "none",
            border: "2px solid #404040",
          }}>
            Sign Up Free
          </Link>
        </div>

        <div style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          marginTop: "4rem",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "🧩", label: "200+ Puzzles" },
            { icon: "📈", label: "Rating System" },
            { icon: "🎯", label: "5 Skill Levels" },
            { icon: "🔥", label: "Daily Streaks" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>{icon}</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.875rem", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
