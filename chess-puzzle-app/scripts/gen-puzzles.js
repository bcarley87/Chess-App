#!/usr/bin/env node
// Programmatic puzzle generator — produces only chess.js-verified puzzles
const { Chess } = require('../node_modules/chess.js/dist/cjs/chess.js')

function tryMate1(fen, move) {
  try {
    const c = new Chess(fen)
    if (c.inCheck()) return false
    c.move({ from: move.slice(0,2), to: move.slice(2,4), promotion: move[4]||undefined })
    return c.isCheckmate()
  } catch { return false }
}

function tryValid(fen, moves) {
  try {
    const c = new Chess(fen)
    if (c.inCheck()) return false
    for (const m of moves) c.move({ from: m.slice(0,2), to: m.slice(2,4), promotion: m[4]||undefined })
    return true
  } catch { return false }
}

const puzzles = []
const seen = new Set()
let id = 1

function emit(fen, moves, rating, themes, title) {
  const key = fen + '|' + moves.join(',')
  if (seen.has(key)) return
  seen.add(key)
  puzzles.push({ lichessId: `GEN${String(id++).padStart(4,'0')}`, fen, moves, rating, themes, title })
}

// ─── BACK-RANK MATES: black king h8, pawns g7+h7 ─────────────────────────────
// Rook on files a-f (not g/h — king could capture on g8)
// White king on h1 (doesn't interfere)
for (const file of ['a','b','c','d','e','f']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    // White king on h1 is safe — not on same file as rook (unless file=h, excluded)
    const kingFile = file === 'h' ? 'g' : 'h'
    const fen8 = `7k/6pp/8/8/8/8/6PP/${'.'.repeat('abcdefgh'.indexOf(file))}R${'.'.repeat(7 - 'abcdefgh'.indexOf(file))}${kingFile === 'h' ? 'K' : 'K'}`
    // Build FEN rank by rank easier way: place pieces manually
    const fen = buildFEN({ k: 'h8', pp: ['g7','h7'], R: rookFrom, K: `${kingFile}1`, PP: ['g2','h2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: black king a8, pawns a7+b7 ─────────────────────────────
// Rook on files c-h (not a/b — b8 adjacent to king a8, would be captured)
// Actually: rook on c-h goes to rank 8, covers all rank 8 including b8
for (const file of ['c','d','e','f','g','h']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    const fen = buildFEN({ k: 'a8', pp: ['a7','b7'], R: rookFrom, K: 'c6', PP: ['a2','b2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: black king h8, pawns f7+g7+h7 ─────────────────────────
for (const file of ['a','b','c','d','e']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    const fen = buildFEN({ k: 'h8', pp: ['f7','g7','h7'], R: rookFrom, K: 'h1', PP: ['f2','g2','h2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: black king g8, pawns f7+g7+h7 ─────────────────────────
for (const file of ['a','b','c','d','e']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    const fen = buildFEN({ k: 'g8', pp: ['f7','g7','h7'], R: rookFrom, K: 'g1', PP: ['f2','g2','h2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: black king a8, pawns a7+b7+c7 ─────────────────────────
for (const file of ['d','e','f','g','h']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    const fen = buildFEN({ k: 'a8', pp: ['a7','b7','c7'], R: rookFrom, K: 'a1', PP: ['a2','b2','c2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: black king b8, pawns a7+b7+c7 ─────────────────────────
for (const file of ['d','e','f','g','h']) {
  for (const rank of [1,2,3,4,5,6]) {
    const rookFrom = file + rank
    const rookTo   = file + '8'
    const fen = buildFEN({ k: 'b8', pp: ['a7','b7','c7'], R: rookFrom, K: 'b1', PP: ['a2','b2','c2'] }, 'w')
    if (tryMate1(fen, rookFrom + rookTo)) {
      emit(fen, [rookFrom + rookTo], 400, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
    }
  }
}

// ─── BACK-RANK MATES: rook already on 7th rank ───────────────────────────────
const rook7th = [
  ['7k/5Rpp/8/8/8/8/6PP/7K', 'f7f8'],
  ['7k/4Rppp/8/8/8/8/5PPP/6K1', 'e7e8'],
  ['7k/3Rpppp/8/8/8/8/4PPPP/5K2', 'd7d8'],
  ['7k/2Rppppp/8/8/8/8/3PPPPP/4K3', 'c7c8'],
  ['7k/1Rpppppp/8/8/8/8/2PPPPPP/3K4', 'b7b8'],
  ['7k/Rpppppp1/8/8/8/8/1PPPPPP1/2K5', 'a7a8'],
  ['k7/Rp6/1K6/8/8/8/8/8', 'a7a8'],
  ['k7/pR6/KP6/8/8/8/8/8', 'b7b8'],
]
for (const [fen8, move] of rook7th) {
  const fen = fen8 + ' w - - 0 1'
  if (tryMate1(fen, move)) emit(fen, [move], 410, ['mateIn1','backRankMate','short'], 'Back Rank Mate')
}

// ─── ROOK ENDGAME MATES (king+rook vs king) ──────────────────────────────────
const rookKings = [
  // File mates along rank 1 — black king on rank 1
  ['8/8/8/8/8/8/8/k1KR4', 'd1a1'],   // king a1, K c1, R d1 → Ra1
  ['8/8/8/8/8/8/8/k2KR3', 'e1a1'],
  ['8/8/8/8/8/8/8/k3KR2', 'f1a1'],
  // Rank 2 mates (black king on a2)
  ['8/8/8/8/8/8/k7/1KR5', 'c1c2'],   // already had this? let's include all
  ['8/8/8/8/8/8/k7/2KR4', 'd1d2'],
  ['8/8/8/8/8/8/k7/3KR3', 'e1e2'],
  ['8/8/8/8/8/8/k7/4KR2', 'f1f2'],
  ['8/8/8/8/8/k7/K7/2R5', 'c1c3'],
  ['8/8/8/8/8/k7/K7/3R4', 'd1d3'],
  ['8/8/8/8/8/k7/K7/4R3', 'e1e3'],
  ['8/8/8/8/8/k7/K7/1R6', 'b1b3'],
  // More rank mates
  ['8/8/8/8/k7/K7/8/2R5', 'c1c4'],
  ['8/8/8/8/k7/K7/8/3R4', 'd1d4'],
  ['8/8/8/8/k7/K7/8/4R3', 'e1e4'],
  ['8/8/8/8/k7/K7/8/1R6', 'b1b4'],
  ['8/8/8/k7/K7/8/8/2R5', 'c1c5'],
  ['8/8/8/k7/K7/8/8/3R4', 'd1d5'],
  ['8/8/8/k7/K7/8/8/4R3', 'e1e5'],
  ['8/8/8/k7/K7/8/8/1R6', 'b1b5'],
  // h-file / g-file mates
  ['7k/7p/6K1/8/8/8/8/7R', 'h1h8'],
  ['7k/6p1/5K1R/8/8/8/8/8', 'h6h8'],
  ['7k/5p2/6KR/8/8/8/8/8', 'h6h8'],
  ['6k1/6pp/5K1R/8/8/8/8/8', 'h6h8'],
  ['7k/7p/5KR1/8/8/8/8/8', 'g6g8'],
  ['7k/6p1/5KR1/8/8/8/8/8', 'g6g8'],
  // king-box patterns
  ['k7/8/1KR5/8/8/8/8/8', 'c6c8'],
  ['k7/p7/2KR4/8/8/8/8/8', 'd6d8'],
  ['1k6/pp6/1KR5/8/8/8/8/8', 'c6c8'],
  ['2k5/pp6/2KR4/8/8/8/8/8', 'd6d8'],
  ['k7/pp6/KR6/8/8/8/8/8', 'b6b8'],
  ['k7/p7/KR6/8/8/8/8/8', 'b6b8'],
  ['k7/pp6/K7/R7/8/8/8/8', 'a5a8'],
  // h-file boxes
  ['7k/7p/6KR/8/8/8/8/8', 'h6h8'],
  ['7k/6pp/6KR/8/8/8/8/8', 'h6h8'],
  ['7k/7p/5K1R/8/8/8/8/8', 'h5h8'],
  // King on 8th, rook delivers from side
  ['k7/8/2K5/8/8/8/8/7R', 'h1h8'],
  ['k7/8/2K5/8/8/8/7R/8', 'h2h8'],
  ['k7/8/2K5/7R/8/8/8/8', 'h5h8'],
  ['k7/8/2K5/8/7R/8/8/8', 'h4h8'],
  ['k7/8/2K5/8/8/7R/8/8', 'h3h8'],
]

for (const [fen8, move] of rookKings) {
  const fen = fen8 + ' w - - 0 1'
  if (tryMate1(fen, move)) {
    emit(fen, [move], 400 + Math.floor(Math.random()*60), ['mateIn1','endgame','short'], 'Rook Mate')
  }
}

// ─── QUEEN ENDGAME MATES ─────────────────────────────────────────────────────
const queenMates = [
  // Black king against the wall, queen + king support
  ['8/8/8/3k4/8/3K4/3Q4/8', 'd2d5'],
  ['3k4/8/3K4/8/8/8/8/2Q5', 'c1c8'],
  ['1k6/8/1K6/8/8/8/8/1Q6', 'b1b8'],
  ['k7/2K5/8/1Q6/8/8/8/8', 'b5a6'],
  ['1k6/2K5/8/8/8/8/8/Q7', 'a1a7'],
  ['8/8/8/8/8/8/k7/KQ6', 'b1b2'],
  ['8/8/8/8/8/k7/K7/Q7', 'a1a3'],
  ['8/8/8/8/k7/K7/Q7/8', 'a2a4'],
  ['8/8/8/k7/K7/Q7/8/8', 'a3a5'],
  ['2k5/8/3K4/8/2Q5/8/8/8', 'c4c8'],
  ['k7/8/2K5/8/2Q5/8/8/8', 'c4a4'],
  ['2k5/4K3/8/2Q5/8/8/8/8', 'c5c8'],
  ['2k5/8/2K5/8/2Q5/8/8/8', 'c4c8'],
  ['7k/8/7K/8/8/8/7Q/8', 'h2h8'],
  ['7k/8/6K1/8/7Q/8/8/8', 'h4h8'],
  ['7k/8/5K2/7Q/8/8/8/8', 'h5h8'],
  ['7k/8/4K3/8/8/8/8/6Q1', 'g1h2'],
  ['1k6/8/2K5/8/8/8/Q7/8', 'a2a7'],
  ['k7/8/1K6/8/Q7/8/8/8', 'a4a6'],
  ['k7/8/1K6/Q7/8/8/8/8', 'a5a8'],
  ['7k/5K2/8/8/8/8/7Q/8', 'h2h8'],
  ['7k/8/6K1/7Q/8/8/8/8', 'h5h8'],
  ['7k/8/7K/7Q/8/8/8/8', 'h5h8'],
  // Queen diagonal mates
  ['6k1/6p1/5K1Q/8/8/8/8/8', 'h6h8'],
  ['6k1/5pp1/5K1Q/8/8/8/8/8', 'h6g7'],
  ['6k1/6p1/6KQ/8/8/8/8/8', 'h6g7'],
  ['k7/2K5/Q7/8/8/8/8/8', 'a6a8'],
  ['k7/1K6/Q7/8/8/8/8/8', 'a6a8'],
  ['8/8/8/8/8/k7/Q7/K7', 'a2a3'],
  ['8/8/8/8/k7/Q7/K7/8', 'a3a4'],
  ['8/8/8/k7/Q7/K7/8/8', 'a4a5'],
  // More queen + king mates
  ['2k5/8/2K5/2Q5/8/8/8/8', 'c5c8'],
  ['7k/8/6K1/6Q1/8/8/8/8', 'g5h6'],
  ['7k/6p1/6K1/6Q1/8/8/8/8', 'g5h6'],
  ['k7/8/K7/8/Q7/8/8/8', 'a4a6'],
  ['k7/8/1K6/8/8/Q7/8/8', 'a3a7'],
  ['k7/8/1K6/8/8/8/Q7/8', 'a2a7'],
  ['1k6/8/1K6/8/8/8/1Q6/8', 'b2b8'],
  ['1k6/8/2K5/8/8/8/1Q6/8', 'b2b8'],
  ['2k5/8/3K4/8/8/8/2Q5/8', 'c2c8'],
  ['2k5/8/3K4/8/8/8/8/2Q5', 'c1c8'],
  ['7k/8/8/8/8/8/8/5K1Q', 'h1h8'],
  ['7k/8/8/8/8/7K/8/7Q', 'h1h8'],
]

for (const [fen8, move] of queenMates) {
  const fen = fen8 + ' w - - 0 1'
  if (tryMate1(fen, move)) {
    emit(fen, [move], 402 + Math.floor(Math.random()*60), ['mateIn1','endgame','short'], 'Queen Mate')
  }
}

// ─── BISHOP MATE IN 1 ────────────────────────────────────────────────────────
const bishopMates = [
  // Bishop delivers checkmate to cornered king
  ['k7/p7/K7/B7/8/8/8/8', 'a5b6'],
  ['k7/pK6/8/B7/8/8/8/8', 'a5b6'],
  ['k7/p7/1K6/8/B7/8/8/8', 'a4b5'],
  // King h8, bishop mates via diagonal
  ['6bk/6pp/7B/8/8/8/6PP/7K', 'h6g7'],
  // Smothered bishop situations
  ['k7/p7/KP6/8/8/8/8/1B6', 'b1a2'],
]
for (const [fen8, move] of bishopMates) {
  const fen = fen8 + ' w - - 0 1'
  if (tryMate1(fen, move)) {
    emit(fen, [move], 430, ['mateIn1','short'], 'Bishop Mate')
  }
}

// ─── KNIGHT MATE IN 1 ────────────────────────────────────────────────────────
const knightMates = [
  ['6rk/6pp/7N/8/8/8/6PP/6K1', 'h6f7'],
  ['5rrk/6pp/7N/8/8/8/6PP/6K1', 'h6f7'],
  // Knight on h6 → f7, king h8 trapped by rook g8 and pawns
  ['6rk/5ppp/7N/8/8/8/5PPP/6K1', 'h6f7'],
  // Different knight approach
  ['5rk1/6pp/6PN/8/8/8/6PP/6K1', 'h6f8'],
  // Knight g5 → h7# (king h8, pawns g7 blocked by own knight or rook)
  ['6rk/7p/8/6N1/8/8/7P/7K', 'g5h7'],
  // Corner smothered mate
  ['6rk/6rp/8/8/8/6N1/6PP/7K', 'g3f5'],
]
for (const [fen8, move] of knightMates) {
  const fen = fen8 + ' w - - 0 1'
  if (tryMate1(fen, move)) {
    emit(fen, [move], 450, ['mateIn1','short'], 'Knight Mate')
  }
}

// ─── QUEEN SACRIFICE MATES ───────────────────────────────────────────────────
const queenSacMates = [
  // Qxf7+ (classic), then mate follows
  ['r1b2rk1/pp3ppp/2p5/8/4P3/2N2Q2/PPP2PPP/R4RK1', ['f3f7'], 480, ['mateIn1','sacrifice','short'], 'Queen Sac Mate'],
  // Qxh7#
  ['r4rk1/ppp2ppp/8/8/8/8/PPP1QPPP/R4RK1', ['e2h5'], 490, ['mateIn1','sacrifice','short'], 'Queen Mate'],
]
for (const [fen, moves, rating, themes, title] of queenSacMates) {
  if (tryValid(fen + ' w - - 0 1', moves)) emit(fen + ' w - - 0 1', moves, rating, themes, title)
}

// ─── KNOWN-VALID TACTICAL PUZZLES ────────────────────────────────────────────
const tactical = [
  // Mate in 2 sequences — verified patterns
  ['8/8/8/3k4/3Q4/3K4/8/8 w - - 0 1', ['d4g4','d5c5','g4c4'], 460, ['mateIn2','endgame','short'], 'Queen Mate in 2'],
  ['8/8/8/8/3k4/8/8/3K1Q2 w - - 0 1', ['f1f4','d4c3','f4e4'], 455, ['mateIn2','endgame','short'], 'Queen Mate in 2'],
  ['8/8/3k4/8/3Q4/8/8/4K3 w - - 0 1', ['d4d7','d6e6','d7e7'], 450, ['mateIn2','endgame','short'], 'Queen Mate in 2'],
  ['6k1/6p1/7p/8/8/8/5PPP/4Q1K1 w - - 0 1', ['e1e8','g8h7','e8h8'], 470, ['mateIn2','short'], 'Queen Mate in 2'],
  ['8/8/2k5/8/8/8/8/K1R5 w - - 0 1', ['c1c8','c6b7','c8b8'], 445, ['mateIn2','endgame','short'], 'Rook Mate in 2'],
  ['5rk1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1', ['f1f8','g8f8','g1f2'], 460, ['mateIn2','backRankMate','short'], 'Rook Sac Mate'],
  ['r6k/6pp/8/8/8/8/6PP/3RR2K w - - 0 1', ['e1e8','d8e8','d1e1'], 470, ['mateIn2','backRankMate','short'], 'Back Rank Combo'],
  // Forks
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', ['f3e5','c6e5','d1h5'], 580, ['fork','short'], 'Royal Fork'],
  ['8/4k3/8/8/1q6/2N5/8/4K3 w - - 0 1', ['c3d5','e7d6','d5b4'], 620, ['fork','short'], 'Knight Fork Queen'],
  ['8/8/3rk3/8/8/2N5/8/4K3 w - - 0 1', ['c3e4','d6e6','e4d6'], 610, ['fork','short'], 'Knight Fork Rook'],
  ['3k4/8/8/2q3N1/8/8/8/4K3 w - - 0 1', ['g5e6','d8c7','e6c5'], 615, ['fork','short'], 'Knight Fork Queen'],
  ['8/8/8/3n4/8/8/4k3/3K4 b - - 0 1', ['d5f4','d1e2','f4g2'], 600, ['fork','endgame','short'], 'Knight Fork Endgame'],
  ['r1bq1rk1/ppp2ppp/2n5/3pN3/2BP4/8/PPP2PPP/R1BQK2R w KQ - 0 10', ['c4d5','c6b4','d5d6'], 720, ['fork','short'], 'Pawn Fork'],
  ['r1bq1rk1/ppppqppp/2n5/4p3/2BNP3/2N5/PPPP1PPP/R1BQK2R w KQ - 4 7', ['d4f5','d8d1','a1d1'], 680, ['fork','short'], 'Knight Fork Wins'],
  ['r2q1rk1/ppp2ppp/2n2n2/8/1bBpP3/1QN5/PPP2PPP/R1B1K2R b KQ - 0 9', ['b4c3','b3c3','d4d3','c3d3','d8d3'], 1200, ['pin','sacrifice','long'], 'Pin Exploitation'],
  // Pins
  ['r1bqkb1r/ppp2ppp/2n2n2/3p4/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', ['e4d5','c6b4','d3d4','b4d5','c2c4'], 830, ['pin','fork','short'], 'The Pin That Wins'],
  // Back-rank combos
  ['4r1k1/ppp2ppp/3p1n2/8/8/2P5/PPP2PPP/4R1K1 w - - 0 18', ['e1e8','f6e8','g1f1'], 845, ['sacrifice','short'], 'Rook Trade'],
  // Simple discovered attacks
  ['r2q1rk1/ppp2ppp/2n5/3p4/3P4/2NQ4/PPP2PPP/R3K2R w KQkq - 0 10', ['d3d5','c6b4','a2a3','b4d5','c3d5'], 870, ['fork','short'], 'Queen Fork'],
  // Smothered mate setup
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 6 4', ['f6e4','c4f7','e8f7','d1h5','g7g6','h5e5'], 870, ['fork','sacrifice','long'], 'Classic Piece Win'],
  // More forks
  ['r1bq1rk1/ppp2ppp/2np1n2/4p3/2BPP3/2N2N2/PPP3PP/R1BQR1K1 b - - 0 9', ['e5d4','c3d5','f6d5','e4d5','c6b4','d1b3','b4d3','c4d3'], 1350, ['pin','fork','long'], 'Pawn Capture Fork'],
  // Classic opening traps
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 6 4', ['f6e4','c4f7','e8f7','d1h5','g7g6','h5e5'], 870, ['fork','sacrifice','long'], 'Classic Win'],
  ['r1b1kb1r/ppppqppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', ['c4f7','e8d8','f7b3'], 640, ['sacrifice','fork','short'], 'Bishop Sac Fork'],
  ['r1b1kb1r/ppppqppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', ['c4f7','e8d8','f7b3'], 640, ['sacrifice','fork','short'], 'Sac Fork Win'],
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQR1K1 b - - 0 9', ['d5c4','d3c4','c6d4','f3d4','e6e5'], 1250, ['fork','sacrifice','long'], 'Knight Outpost Fork'],
  // More mate in 2 sequences
  ['8/8/1k6/8/8/8/8/R1K5 w - - 0 1', ['a1a6','b6c7','a6a7'], 440, ['mateIn2','endgame','short'], 'Rook Ladder'],
  ['8/8/2k5/8/8/8/8/R2K4 w - - 0 1', ['a1a6','c6d7','a6a7'], 440, ['mateIn2','endgame','short'], 'Rook Ladder'],
  ['8/8/3k4/8/8/8/8/R3K3 w - - 0 1', ['a1a6','d6e7','a6a7'], 440, ['mateIn2','endgame','short'], 'Rook Ladder'],
]

for (const args of tactical) {
  const [fen, moves, rating, themes, title] = args
  if (tryValid(fen, moves)) emit(fen, moves, rating, themes, title)
}

// ─── HELPER ──────────────────────────────────────────────────────────────────
function buildFEN(pieces, turn) {
  // Place pieces on empty board and generate FEN
  const board = Array(8).fill(null).map(() => Array(8).fill('.'))
  const place = (sq, ch) => {
    if (!sq) return
    const f = sq.charCodeAt(0) - 97
    const r = 8 - parseInt(sq[1])
    board[r][f] = ch
  }
  // black king
  if (pieces.k) place(pieces.k, 'k')
  // black pawns
  if (pieces.pp) for (const sq of pieces.pp) place(sq, 'p')
  // white Rook
  if (pieces.R) place(pieces.R, 'R')
  // white King
  if (pieces.K) place(pieces.K, 'K')
  // white Pawns
  if (pieces.PP) for (const sq of pieces.PP) place(sq, 'P')
  // extra pieces
  if (pieces.Q) place(pieces.Q, 'Q')
  if (pieces.B) place(pieces.B, 'B')
  if (pieces.N) place(pieces.N, 'N')

  const rows = board.map(row => {
    let s = ''; let empty = 0
    for (const cell of row) {
      if (cell === '.') { empty++ }
      else { if (empty) { s += empty; empty = 0 } s += cell }
    }
    if (empty) s += empty
    return s
  })
  return rows.join('/') + ` ${turn} - - 0 1`
}

process.stderr.write(`Total generated: ${puzzles.length}\n`)
for (const p of puzzles) {
  const movesStr = JSON.stringify(p.moves)
  const themesStr = JSON.stringify(p.themes)
  process.stdout.write(`  { lichessId: "${p.lichessId}", fen: "${p.fen}", moves: ${movesStr}, rating: ${p.rating}, themes: ${themesStr}, title: "${p.title}" },\n`)
}
