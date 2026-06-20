import type { ComponentType } from 'react'
import { gameMetadata, type GameMetadata } from './metadata'
import { SnakePage } from '../pages/games/SnakePage'
import { MemoryPage } from '../pages/games/MemoryPage'
import { ReactionPage } from '../pages/games/ReactionPage'

export interface GameDefinition extends GameMetadata {
  component: ComponentType
}

const components: Record<string, ComponentType> = {
  snake: SnakePage,
  memory: MemoryPage,
  reaction: ReactionPage,
}

export const games: GameDefinition[] = gameMetadata.map((meta) => ({
  ...meta,
  component: components[meta.id],
}))

export { gameMetadata, getGameById } from './metadata'
