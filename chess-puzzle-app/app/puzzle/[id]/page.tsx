import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import PuzzleClient from "./PuzzleClient"

export default async function PuzzlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ themes?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const { themes } = await searchParams

  const [puzzle, user, previousProgress] = await Promise.all([
    prisma.puzzle.findUnique({ where: { id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { puzzleRating: true } }),
    prisma.puzzleProgress.findUnique({
      where: { userId_puzzleId: { userId: session.user.id, puzzleId: id } },
    }),
  ])

  if (!puzzle) redirect("/dashboard")

  return (
    <PuzzleClient
      puzzle={puzzle}
      userRating={user?.puzzleRating ?? 800}
      previouslySolved={previousProgress?.solved ?? false}
      activeThemes={themes ?? ""}
    />
  )
}
