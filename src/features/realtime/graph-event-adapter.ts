import type {
  InboundGraphEvent,
  InboundLayoutDirection,
} from '#/features/graph/contracts/inbound-graph-events'
import type { GraphConnectionStatus } from '#/features/graph/types/graph'

export type GraphEventListener = (event: InboundGraphEvent) => void

export interface GraphEventAdapterLifecycle {
  connect(): Promise<void> | void
  disconnect(): Promise<void> | void
}

export interface GraphEventAdapter extends GraphEventAdapterLifecycle {
  readonly name: string
  subscribe(listener: GraphEventListener): () => void
}

export interface GraphEventAdapterOptions {
  onEvent: GraphEventListener
  onStatusChange?: (status: GraphConnectionStatus) => void
  onLayoutPreferenceChange?: (direction: InboundLayoutDirection) => void
}

export type GraphEventAdapterFactory = (
  options: GraphEventAdapterOptions
) => GraphEventAdapter
