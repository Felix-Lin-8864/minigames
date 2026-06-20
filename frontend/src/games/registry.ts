import type { ComponentType } from 'react'
import { gameMetadata, type GameMetadata } from './metadata'
import { AnagramsPage } from '../pages/games/AnagramsPage'
import { FroggerPage } from '../pages/games/FroggerPage'
import { MemoryPage } from '../pages/games/MemoryPage'
import { ReactionPage } from '../pages/games/ReactionPage'
import { SnakePage } from '../pages/games/SnakePage'

export interface GameDefinition extends GameMetadata {
  component: ComponentType
}

const components: Record<string, ComponentType> = {
  snake: SnakePage,
  frogger: FroggerPage,
  memory: MemoryPage,
  reaction: ReactionPage,
  anagrams: AnagramsPage,
}

export const games: GameDefinition[] = gameMetadata.map((meta) => ({
  ...meta,
  component: components[meta.id],
}))

export { gameMetadata, getGameById } from './metadata'
