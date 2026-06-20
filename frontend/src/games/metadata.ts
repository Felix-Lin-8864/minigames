import PsychologyIcon from '@mui/icons-material/Psychology'
import BoltIcon from '@mui/icons-material/Bolt'
import type { ElementType } from 'react'
import { FrogIcon } from '../components/icons/FrogIcon'
import type { StatField } from '../stats/types'

export interface GameMetadata {
  id: string
  name: string
  description: string
  route: string
  icon: ElementType
  statFields: StatField[]
}

export const gameMetadata: GameMetadata[] = [
  {
    id: 'frogger',
    name: 'Frogger',
    description: 'Hop endlessly through traffic and rivers — how far can you go?',
    route: '/games/frogger',
    icon: FrogIcon as ElementType,
    statFields: [{ key: 'highScore', label: 'Best Distance', format: 'score' }],
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Flip cards and find matching pairs as fast as you can.',
    route: '/games/memory',
    icon: PsychologyIcon,
    statFields: [{ key: 'bestTime', label: 'Best Time', format: 'time' }],
  },
  {
    id: 'reaction',
    name: 'Reaction Time',
    description: 'Test your reflexes — click as soon as the screen changes color.',
    route: '/games/reaction',
    icon: BoltIcon,
    statFields: [
      { key: 'fastestReaction', label: 'Fastest Reaction', format: 'duration' },
    ],
  },
]

export function getGameById(id: string): GameMetadata | undefined {
  return gameMetadata.find((g) => g.id === id)
}
