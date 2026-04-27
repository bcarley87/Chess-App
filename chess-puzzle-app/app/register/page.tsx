"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true)
    setError("")

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Registration failed")
      setLoading(false)
      return
    }

    await signIn("credentials", { email, password, redirect: false })
    router.push("/dashboard")
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "48px" }}>♟</div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Start solving puzzles for free</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={styles.label}>Name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} placeholder="Magnus" />
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="Min. 8 characters" required />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#a0a0a0", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#7fa650" }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  card: { background: "#262626", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "420px", border: "1px solid #404040" },
  title: { fontSize: "1.75rem", fontWeight: "700", color: "#e8e8e8", margin: "0.5rem 0 0.25rem" },
  subtitle: { color: "#a0a0a0", fontSize: "0.9rem", margin: 0 },
  label: { display: "block", color: "#a0a0a0", fontSize: "0.875rem", marginBottom: "0.375rem" },
  input: { width: "100%", padding: "0.75rem 1rem", background: "#1a1a1a", border: "1px solid #404040", borderRadius: "8px", color: "#e8e8e8", fontSize: "1rem", outline: "none" },
  btn: { padding: "0.875rem", background: "#7fa650", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
  error: { background: "#3d1a1a", border: "1px solid #c95a5a", color: "#ff9999", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "1rem" },
}
