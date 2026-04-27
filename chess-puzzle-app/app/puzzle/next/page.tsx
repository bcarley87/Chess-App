import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function NextPuzzle({
  searchParams,
}: {
  searchParams: Promise<{ min?: string; max?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { min, max } = await searchParams
  const minRating = parseInt(min ?? "400")
  const maxRating = parseInt(max ?? "2200")
  const userId = session.user.id

  // Exclude attempted puzzles so we don't repeat the same one
  const attempted = await prisma.puzzleProgress.findMany({
    where: { userId },
    select: { puzzleId: true },
  })
  const attemptedIds = attempted.map((p) => p.puzzleId)

  // Pick a random unsolved puzzle in range; fall back to any in range if all attempted
  const candidates = await prisma.puzzle.findMany({
    where: {
      rating: { gte: minRating, lte: maxRating },
      id: attemptedIds.length > 0 ? { notIn: attemptedIds } : undefined,
    },
    select: { id: true },
  })

  let puzzleId: string | undefined
  if (candidates.length > 0) {
    puzzleId = candidates[Math.floor(Math.random() * candidates.length)].id
  } else {
    // All puzzles in range attempted — pick any random one
    const anyInRange = await prisma.puzzle.findMany({
      where: { rating: { gte: minRating, lte: maxRating } },
      select: { id: true },
    })
    if (anyInRange.length > 0) {
      puzzleId = anyInRange[Math.floor(Math.random() * anyInRange.length)].id
    }
  }

  const puzzle = puzzleId ? await prisma.puzzle.findUnique({ where: { id: puzzleId } }) : null

  if (!puzzle) {
    redirect(`/dashboard`)
  }

  redirect(`/puzzle/${puzzle.id}`)
}
