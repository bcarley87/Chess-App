import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const [user, stats, recentProgress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { puzzleRating: true, name: true } }),
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.puzzleProgress.findMany({
      where: { userId },
      include: { puzzle: { select: { rating: true, themes: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  return Response.json({ user, stats, recentProgress })
}
