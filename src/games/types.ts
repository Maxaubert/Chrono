/**
 * A game module plugs a specific game (Hitster, History, ...) into the shared
 * shell and engine. The shell discovers games through the registry and never
 * hard-codes any single game.
 *
 * This interface is intentionally minimal for Phase 0; Phase 1 expands it with
 * deck building, reveal data, and the audio source descriptor.
 */
export interface GameModule {
  readonly id: string
  readonly name: string
  readonly description: string
}
