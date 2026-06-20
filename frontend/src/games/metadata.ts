import AbcIcon from '@mui/icons-material/Abc'
import type { ElementType } from 'react'
import { FrogIcon } from '../components/icons/FrogIcon'
import { SnakeIcon } from '../components/icons/SnakeIcon'
import { TwentyOneIcon } from '../components/icons/TwentyOneIcon'
import type { StatField } from '../stats/types'

export type GameCategory = 'mini' | 'frogtune'

export interface GameMetadata {
  id: string
  name: string
  description: string
  route: string
  icon: ElementType
  category: GameCategory
  statFields: StatField[]
}

export const gameMetadata: GameMetadata[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Slither around the pond, eat dots, and grow without crashing.',
    route: '/games/snake',
    icon: SnakeIcon as ElementType,
    category: 'mini',
    statFields: [{ key: 'highScore', label: 'High Score', format: 'score' }],
  },
  {
    id: 'frogger',
    name: 'Frogger',
    description: 'Hop endlessly through traffic and rivers — how far can you go?',
    route: '/games/frogger',
    icon: FrogIcon as ElementType,
    category: 'mini',
    statFields: [{ key: 'highScore', label: 'Best Distance', format: 'score' }],
  },
  {
    id: 'anagrams',
    name: 'Anagrams',
    description: 'Form words from random letters and rack up points before time runs out.',
    route: '/games/anagrams',
    icon: AbcIcon,
    category: 'mini',
    statFields: [{ key: 'highScore', label: 'High Score', format: 'score' }],
  },
  {
    id: 'twenty-one',
    name: 'Twenty-One',
    description: 'Bet tadpoles at the blackjack table — optional stats and Hi-Lo panels included.',
    route: '/games/twenty-one',
    icon: TwentyOneIcon as ElementType,
    category: 'frogtune',
    statFields: [{ key: 'handsWon', label: 'Hands Won', format: 'score' }],
  },
]

export const miniGameMetadata = gameMetadata.filter((game) => game.category === 'mini')

export const frogtuneGameMetadata = gameMetadata.filter((game) => game.category === 'frogtune')

export function getGameById(id: string): GameMetadata | undefined {
  return gameMetadata.find((g) => g.id === id)
}
