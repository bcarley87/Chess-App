import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function NextPuzzle({
  searchParams,
}: {
  searchParams: Promise<{ min?: string; max?: string; themes?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const minRating = parseInt(params.min ?? "400")
  const maxRating = parseInt(params.max ?? "2200")
  const themeList = params.themes ? params.themes.split(",").filter(Boolean) : []
  const userId = session.user.id

  const attempted = await prisma.puzzleProgress.findMany({
    where: { userId },
    select: { puzzleId: true },
  })
  const attemptedIds = attempted.map((p) => p.puzzleId)

  const baseWhere = {
    rating: { gte: minRating, lte: maxRating },
    ...(themeList.length > 0 ? { themes: { hasSome: themeList } } : {}),
  }

  const candidates = await prisma.puzzle.findMany({
    where: { ...baseWhere, ...(attemptedIds.length > 0 ? { id: { notIn: attemptedIds } } : {}) },
    select: { id: true },
  })

  let puzzleId: string | undefined
  if (candidates.length > 0) {
    puzzleId = candidates[Math.floor(Math.random() * candidates.length)].id
  } else {
    // All matching puzzles attempted — allow repeats
    const anyMatch = await prisma.puzzle.findMany({ where: baseWhere, select: { id: true } })
    if (anyMatch.length > 0) {
      puzzleId = anyMatch[Math.floor(Math.random() * anyMatch.length)].id
    }
  }

  if (!puzzleId) redirect("/dashboard")

  const themeParam = themeList.length > 0 ? `?themes=${themeList.join(",")}` : ""
  redirect(`/puzzle/${puzzleId}${themeParam}`)
}
