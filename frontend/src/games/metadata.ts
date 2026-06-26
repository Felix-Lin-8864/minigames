import AbcIcon from '@mui/icons-material/Abc'
import type { ElementType } from 'react'
import { FrogIcon } from '../components/icons/FrogIcon'
import { SnakeIcon } from '../components/icons/SnakeIcon'
import { StackerIcon } from '../components/icons/StackerIcon'
import { TwentyOneIcon } from '../components/icons/TwentyOneIcon'
import { RouletteIcon } from '../components/icons/RouletteIcon'
import { SlotsIcon } from '../components/icons/SlotsIcon'
import { PlinkoIcon } from '../components/icons/PlinkoIcon'
import { FroggiesIcon } from '../components/icons/FroggiesIcon'
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
    id: 'stacker',
    name: 'Stacker',
    description: 'Drop sliding blocks onto the stack — align perfectly or watch your platform shrink.',
    route: '/games/stacker',
    icon: StackerIcon as ElementType,
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
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'European single-zero roulette — place chips on the table and spin for tadpoles.',
    route: '/games/roulette',
    icon: RouletteIcon as ElementType,
    category: 'frogtune',
    statFields: [],
  },
  {
    id: 'slots',
    name: 'Slots',
    description: 'Three-reel slots — match symbols on the payline to multiply your tadpole bet.',
    route: '/games/slots',
    icon: SlotsIcon as ElementType,
    category: 'frogtune',
    statFields: [],
  },
  {
    id: 'plinko',
    name: 'Plinko',
    description: 'Drop a ball through the pegs — pick your risk tier and land a multiplier slot.',
    route: '/games/plinko',
    icon: PlinkoIcon as ElementType,
    category: 'frogtune',
    statFields: [],
  },
  {
    id: 'froggies',
    name: 'Froggies',
    description: 'Five coloured frogs race along the track — bet on the exact finishing order.',
    route: '/games/froggies',
    icon: FroggiesIcon as ElementType,
    category: 'frogtune',
    statFields: [],
  },
]

export const miniGameMetadata = gameMetadata.filter((game) => game.category === 'mini')

export const frogtuneGameMetadata = gameMetadata.filter((game) => game.category === 'frogtune')

export function getGameById(id: string): GameMetadata | undefined {
  return gameMetadata.find((g) => g.id === id)
}
