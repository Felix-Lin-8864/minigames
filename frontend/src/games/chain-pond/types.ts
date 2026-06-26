export type WordLength = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export interface TurnState {
  startLetter: string
  requiredLength: WordLength
  timeRemaining: number
}

export type EndReason = 'timeout' | 'already_used'

export interface ChainPondState {
  chain: string[]
  usedWords: Set<string>
  currentTurn: TurnState
  score: number
  validWords: number
  status: 'idle' | 'playing' | 'ended'
  endReason: EndReason | null
}

export type SubmissionResult =
  | { outcome: 'valid' }
  | { outcome: 'invalid'; reason: 'wrong_letter' | 'wrong_length' | 'not_in_dictionary' }
  | { outcome: 'chain_end'; reason: EndReason }

export interface ChainPondSnapshot {
  chain: string[]
  currentTurn: TurnState
  score: number
  validWords: number
  status: ChainPondState['status']
  endReason: EndReason | null
  finalTadpoles: number
}
