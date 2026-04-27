import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { solved, timeSpent } = await req.json()
  const userId = session.user.id

  const puzzle = await prisma.puzzle.findUnique({ where: { id } })
  if (!puzzle) return Response.json({ error: "Not found" }, { status: 404 })

  const progress = await prisma.puzzleProgress.upsert({
    where: { userId_puzzleId: { userId, puzzleId: id } },
    update: {
      attempts: { increment: 1 },
      solved: solved ? true : undefined,
      timeSpent: { increment: timeSpent ?? 0 },
      completedAt: solved ? new Date() : undefined,
    },
    create: {
      userId,
      puzzleId: id,
      solved,
      attempts: 1,
      timeSpent: timeSpent ?? 0,
      completedAt: solved ? new Date() : undefined,
    },
  })

  // Update user rating and stats
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return Response.json({ error: "User not found" }, { status: 404 })

  const ratingDiff = solved
    ? Math.max(5, Math.round((puzzle.rating - user.puzzleRating) / 10) + 10)
    : Math.min(-5, Math.round((puzzle.rating - user.puzzleRating) / 10) - 10)

  const newRating = Math.max(400, user.puzzleRating + ratingDiff)

  const stats = await prisma.userStats.findUnique({ where: { userId } })
  const now = new Date()
  const lastSolved = stats?.lastSolvedAt
  const isConsecutiveDay =
    lastSolved &&
    now.getTime() - lastSolved.getTime() < 48 * 60 * 60 * 1000

  const newStreak = solved ? (isConsecutiveDay ? (stats?.streak ?? 0) + 1 : 1) : 0
  const ratingHistory = (stats?.ratingHistory as number[]) ?? []
  ratingHistory.push(newRating)
  if (ratingHistory.length > 50) ratingHistory.shift()

  await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { puzzleRating: newRating },
    }),
    prisma.userStats.upsert({
      where: { userId },
      update: {
        totalAttempts: { increment: 1 },
        totalSolved: solved ? { increment: 1 } : undefined,
        streak: newStreak,
        bestStreak: newStreak > (stats?.bestStreak ?? 0) ? newStreak : undefined,
        lastSolvedAt: solved ? now : undefined,
        ratingHistory,
      },
      create: {
        userId,
        totalAttempts: 1,
        totalSolved: solved ? 1 : 0,
        streak: solved ? 1 : 0,
        bestStreak: solved ? 1 : 0,
        lastSolvedAt: solved ? now : undefined,
        ratingHistory: [newRating],
      },
    }),
  ])

  return Response.json({ newRating, ratingDiff, progress })
}
