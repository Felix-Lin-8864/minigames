import type { ComponentType } from 'react'
import { gameMetadata, type GameMetadata } from './metadata'
import { FroggerPage } from '../pages/games/FroggerPage'
import { MemoryPage } from '../pages/games/MemoryPage'
import { ReactionPage } from '../pages/games/ReactionPage'

export interface GameDefinition extends GameMetadata {
  component: ComponentType
}

const components: Record<string, ComponentType> = {
  frogger: FroggerPage,
  memory: MemoryPage,
  reaction: ReactionPage,
}

export const games: GameDefinition[] = gameMetadata.map((meta) => ({
  ...meta,
  component: components[meta.id],
}))

export { gameMetadata, getGameById } from './metadata'
