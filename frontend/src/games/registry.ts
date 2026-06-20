import type { ComponentType } from 'react'
import { gameMetadata, type GameMetadata } from './metadata'
import { AnagramsPage } from '../pages/games/AnagramsPage'
import { FroggerPage } from '../pages/games/FroggerPage'
import { SnakePage } from '../pages/games/SnakePage'

export interface GameDefinition extends GameMetadata {
  component: ComponentType
}

const components: Record<string, ComponentType> = {
  snake: SnakePage,
  frogger: FroggerPage,
  anagrams: AnagramsPage,
}

export const games: GameDefinition[] = gameMetadata
  .filter((meta) => meta.id in components)
  .map((meta) => ({
    ...meta,
    component: components[meta.id],
  }))

export const miniGames = games.filter((game) => game.category === 'mini')

export { gameMetadata, miniGameMetadata, frogtuneGameMetadata, getGameById } from './metadata'
