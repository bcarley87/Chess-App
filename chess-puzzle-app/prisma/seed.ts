import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { SEED_PUZZLES } from "../lib/puzzles-seed"

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding puzzles...")
  let count = 0
  for (const p of SEED_PUZZLES) {
    await prisma.puzzle.upsert({
      where: { lichessId: p.lichessId },
      update: {},
      create: {
        lichessId: p.lichessId,
        fen: p.fen,
        moves: p.moves,
        rating: p.rating,
        themes: p.themes,
        title: p.title,
      },
    })
    count++
  }
  console.log(`Seeded ${count} puzzles.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
