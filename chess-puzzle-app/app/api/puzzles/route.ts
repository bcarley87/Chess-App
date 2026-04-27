import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const minRating = parseInt(searchParams.get("minRating") ?? "400")
  const maxRating = parseInt(searchParams.get("maxRating") ?? "2200")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)

  // Exclude already solved puzzles
  const solved = await prisma.puzzleProgress.findMany({
    where: { userId: session.user.id, solved: true },
    select: { puzzleId: true },
  })
  const solvedIds = solved.map((p) => p.puzzleId)

  const puzzles = await prisma.puzzle.findMany({
    where: {
      rating: { gte: minRating, lte: maxRating },
      id: solvedIds.length > 0 ? { notIn: solvedIds } : undefined,
    },
    orderBy: { rating: "asc" },
    take: limit,
  })

  return Response.json(puzzles)
}
