import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Chess Puzzles",
  description: "Improve your chess with daily tactics puzzles",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  )
}
