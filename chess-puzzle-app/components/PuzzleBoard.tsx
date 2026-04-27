"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Chessboard } from "react-chessboard"
import type { PieceDropHandlerArgs } from "react-chessboard"
import { Chess } from "chess.js"

type Puzzle = {
  id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
  title: string | null
}

type Props = {
  puzzle: Puzzle
  onSolve: (solved: boolean, timeSpent: number) => void
}

type Status = "thinking" | "correct" | "wrong" | "solved" | "failed"

function buildReplayPositions(startFen: string, moves: string[]): { fen: string; from: string; to: string }[] {
  const positions: { fen: string; from: string; to: string }[] = []
  const chess = new Chess(startFen)
  positions.push({ fen: startFen, from: "", to: "" })
  for (const uci of moves) {
    try {
      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promo = uci[4]
      chess.move({ from, to, promotion: promo })
      positions.push({ fen: chess.fen(), from, to })
    } catch {
      break
    }
  }
  return positions
}

export default function PuzzleBoard({ puzzle, onSolve }: Props) {
  const [game, setGame] = useState<Chess | null>(() => {
    try { return new Chess(puzzle.fen) } catch { return null }
  })
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<Status>("thinking")
  const [orientation, setOrientation] = useState<"white" | "black">("white")
  const [squareStyles, setSquareStyles] = useState<Record<string, React.CSSProperties>>({})
  const [showHint, setShowHint] = useState(false)
  const startTimeRef = useRef(Date.now())

  const [replayMode, setReplayMode] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)
  const replayPositions = useRef<{ fen: string; from: string; to: string }[]>([])

  useEffect(() => {
    let chess: Chess
    try { chess = new Chess(puzzle.fen) } catch { setGame(null); return }
    // Player plays as the side whose turn it is in the starting FEN
    setOrientation(chess.turn() === "w" ? "white" : "black")
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setStatus("thinking")
    setSquareStyles({})
    setShowHint(false)
    setReplayMode(false)
    setReplayIndex(0)
    startTimeRef.current = Date.now()
    replayPositions.current = buildReplayPositions(puzzle.fen, puzzle.moves)
  }, [puzzle])

  const handleDrop = useCallback(({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false
    if (status !== "thinking") return false
    if (moveIndex >= puzzle.moves.length) return false

    const expectedUci = puzzle.moves[moveIndex]
    const expectedFrom = expectedUci.slice(0, 2)
    const expectedTo = expectedUci.slice(2, 4)
    const expectedPromo = expectedUci[4]

    const pieceType = piece.pieceType
    const isPromo = pieceType.toLowerCase().includes("p") &&
      ((targetSquare[1] === "8" && pieceType[0] === "w") || (targetSquare[1] === "1" && pieceType[0] === "b"))

    if (sourceSquare !== expectedFrom || targetSquare !== expectedTo) {
      setStatus("wrong")
      setSquareStyles({
        [sourceSquare]: { background: "rgba(220, 50, 50, 0.5)" },
        [targetSquare]: { background: "rgba(220, 50, 50, 0.5)" },
      })
      setTimeout(() => {
        setStatus("thinking")
        setSquareStyles({})
      }, 800)
      return false
    }

    try {
      const chess = new Chess(game!.fen())
      chess.move({ from: sourceSquare, to: targetSquare, promotion: isPromo ? (expectedPromo ?? "q") : undefined })
      const newFen = chess.fen()

      setSquareStyles({
        [sourceSquare]: { background: "rgba(100, 200, 100, 0.5)" },
        [targetSquare]: { background: "rgba(100, 200, 100, 0.5)" },
      })

      const nextIndex = moveIndex + 1

      if (nextIndex >= puzzle.moves.length) {
        // Player completed all moves — puzzle solved
        setGame(new Chess(newFen))
        setMoveIndex(nextIndex)
        setStatus("solved")
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        setTimeout(() => onSolve(true, elapsed), 500)
      } else {
        // Opponent has a response to auto-play
        setGame(new Chess(newFen))
        setMoveIndex(nextIndex)
        setStatus("correct")

        setTimeout(() => {
          try {
            const oppMove = puzzle.moves[nextIndex]
            const chess2 = new Chess(newFen)
            chess2.move({ from: oppMove.slice(0, 2), to: oppMove.slice(2, 4), promotion: oppMove[4] })
            const afterOppFen = chess2.fen()
            const nextPlayerIndex = nextIndex + 1

            setGame(new Chess(afterOppFen))
            setMoveIndex(nextPlayerIndex)
            setSquareStyles({
              [oppMove.slice(0, 2)]: { background: "rgba(255, 200, 0, 0.4)" },
              [oppMove.slice(2, 4)]: { background: "rgba(255, 200, 0, 0.4)" },
            })

            if (nextPlayerIndex >= puzzle.moves.length) {
              // No more player moves — puzzle complete
              setStatus("solved")
              const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
              setTimeout(() => onSolve(true, elapsed), 500)
            } else {
              setStatus("thinking")
            }
          } catch {
            // Opponent move failed — the player's move was already the final answer (e.g. checkmate)
            setStatus("solved")
            const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
            setTimeout(() => onSolve(true, elapsed), 500)
          }
        }, 700)
      }
      return true
    } catch {
      return false
    }
  }, [game, moveIndex, puzzle.moves, status, onSolve])

  const handleGiveUp = () => {
    setStatus("failed")
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    onSolve(false, elapsed)
  }

  const enterReplay = () => {
    if (replayPositions.current.length === 0) {
      replayPositions.current = buildReplayPositions(puzzle.fen, puzzle.moves)
    }
    setReplayMode(true)
    setReplayIndex(0)
  }

  const exitReplay = () => setReplayMode(false)

  const replaySquareStyles = useCallback((idx: number): Record<string, React.CSSProperties> => {
    const pos = replayPositions.current[idx]
    if (!pos || !pos.from) return {}
    return {
      [pos.from]: { background: "rgba(100, 180, 255, 0.5)" },
      [pos.to]: { background: "rgba(100, 180, 255, 0.7)" },
    }
  }, [])

  const hintMove = puzzle.moves[moveIndex]
  const playerColorLabel = orientation === "white" ? "White" : "Black"

  const statusColors: Record<Status, string> = {
    thinking: "#4a9eff",
    correct: "#7fa650",
    wrong: "#c95a5a",
    solved: "#7fa650",
    failed: "#c95a5a",
  }
  const statusMessages: Record<Status, string> = {
    thinking: `${playerColorLabel} to move — find the best move`,
    correct: "Correct! Keep going…",
    wrong: "Not the right move, try again",
    solved: "✓ Puzzle solved!",
    failed: "Puzzle failed — keep practicing",
  }

  const currentReplayPos = replayPositions.current[replayIndex]
  const isFinished = status === "solved" || status === "failed"

  if (!game) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#c95a5a", background: "#262626", borderRadius: "10px" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Invalid puzzle data</div>
        <button onClick={() => onSolve(false, 0)} style={{ ...btnStyle, border: "1px solid #4a9eff", color: "#4a9eff" }}>
          Skip Puzzle →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {replayMode ? (
        <div style={{
          background: "#1e2d3d",
          border: "2px solid #4a9eff",
          borderRadius: "10px",
          padding: "0.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ color: "#4a9eff", fontWeight: "600", fontSize: "0.95rem" }}>
            🎬 Solution — move {replayIndex} of {replayPositions.current.length - 1}
          </span>
          <button onClick={exitReplay} style={{ background: "none", border: "none", color: "#a0a0a0", cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
      ) : (
        <div style={{
          background: "#262626",
          border: `2px solid ${statusColors[status]}`,
          borderRadius: "10px",
          padding: "0.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <div style={{
            width: "10px", height: "10px", borderRadius: "50%",
            background: statusColors[status], flexShrink: 0,
          }} />
          <span style={{ color: statusColors[status], fontWeight: "600", fontSize: "0.95rem" }}>
            {statusMessages[status]}
          </span>
        </div>
      )}

      <div style={{ borderRadius: "8px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <Chessboard
          options={{
            position: replayMode ? (currentReplayPos?.fen ?? puzzle.fen) : game!.fen(),
            onPieceDrop: replayMode ? () => false : handleDrop,
            boardOrientation: orientation,
            squareStyles: replayMode ? replaySquareStyles(replayIndex) : squareStyles,
            boardStyle: { borderRadius: "4px" },
            darkSquareStyle: { backgroundColor: "#769656" },
            lightSquareStyle: { backgroundColor: "#eeeed2" },
            allowDragging: !replayMode && (status === "thinking" || status === "wrong"),
            canDragPiece: !replayMode
              ? ({ piece }) => piece.pieceType[0] === (orientation === "white" ? "w" : "b")
              : undefined,
            arrows: !replayMode && showHint && hintMove
              ? [{ startSquare: hintMove.slice(0, 2), endSquare: hintMove.slice(2, 4), color: "rgba(255, 200, 0, 0.85)" }]
              : [],
            allowDrawingArrows: false,
          }}
        />
      </div>

      {replayMode ? (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setReplayIndex((i) => Math.max(0, i - 1))}
            disabled={replayIndex === 0}
            style={{ ...btnStyle, flex: 1, opacity: replayIndex === 0 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <button
            onClick={() => setReplayIndex((i) => Math.min(replayPositions.current.length - 1, i + 1))}
            disabled={replayIndex >= replayPositions.current.length - 1}
            style={{ ...btnStyle, flex: 1, background: "#4a9eff", border: "1px solid #4a9eff", opacity: replayIndex >= replayPositions.current.length - 1 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {isFinished ? (
            <button
              onClick={enterReplay}
              style={{ ...btnStyle, flex: 1, background: "#1e2d3d", border: "1px solid #4a9eff", color: "#4a9eff" }}
            >
              🎬 Review Solution
            </button>
          ) : (
            <button
              onClick={() => setShowHint(!showHint)}
              style={{ ...btnStyle, flex: 1, background: showHint ? "#383838" : "#2d2d2d" }}
            >
              💡 Hint
            </button>
          )}
          <button
            onClick={handleGiveUp}
            disabled={isFinished}
            style={{ ...btnStyle, flex: 1, border: "1px solid #c95a5a", color: "#c95a5a", opacity: isFinished ? 0.4 : 1 }}
          >
            Give Up
          </button>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: "0.65rem",
  background: "#2d2d2d",
  border: "1px solid #404040",
  borderRadius: "8px",
  color: "#e8e8e8",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
}
