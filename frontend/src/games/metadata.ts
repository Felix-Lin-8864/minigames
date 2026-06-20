import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import PsychologyIcon from '@mui/icons-material/Psychology'
import BoltIcon from '@mui/icons-material/Bolt'
import type { SvgIconComponent } from '@mui/icons-material'
import type { StatField } from '../stats/types'

export interface GameMetadata {
  id: string
  name: string
  description: string
  route: string
  icon: SvgIconComponent
  statFields: StatField[]
}

export const gameMetadata: GameMetadata[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game — grow longer by eating food without hitting walls or yourself.',
    route: '/games/snake',
    icon: SportsEsportsIcon,
    statFields: [{ key: 'highScore', label: 'High Score', format: 'score' }],
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
