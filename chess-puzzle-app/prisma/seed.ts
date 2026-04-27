import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { SEED_PUZZLES } from "../lib/puzzles-seed"

const rawUrl = new URL(process.env.DATABASE_URL!)
rawUrl.searchParams.set("sslmode", "verify-full")
const pool = new Pool({ connectionString: rawUrl.toString() })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding puzzles...")
  let count = 0
  for (const p of SEED_PUZZLES) {
    const data = {
      lichessId: p.lichessId,
      fen: p.fen,
      moves: p.moves,
      rating: p.rating,
      themes: p.themes,
      title: p.title,
    }
    await prisma.puzzle.upsert({
      where: { lichessId: p.lichessId },
      update: data,
      create: data,
    })
    count++
  }
  console.log(`Seeded ${count} puzzles.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
