# Unravel

Frontend-only TanStack Start scaffold for a voice-native ideation tool. The UI is built to receive real-time graph deltas from an external voice pipeline and render them on a styled React Flow canvas with typed state, layout orchestration, and a clear integration boundary.

## Setup

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
npm run format
npm run check
```

## Stack

- TanStack Start + React + TypeScript
- Tailwind CSS v4 + `@tailwindcss/vite`
- shadcn-style component setup via [`components.json`](./components.json)
- `@xyflow/react` for the graph canvas
- `@dagrejs/dagre` for auto-layout
- `zustand` for client graph state
- `zod` for inbound event validation
- `motion` for shell transitions

## What Is Scaffolded

- Distinctive responsive app shell with:
  - top bar status + layout controls
  - main graph canvas region
  - right-side live transcript/activity panel empty state
- Typed graph foundation:
  - node kinds: `idea`, `category`, `insight`
  - typed edge model
  - Zustand graph store
  - Dagre layout integration
  - custom React Flow node components
- Realtime boundary:
  - strict Zod contracts for inbound graph delta events
  - adapter interface definitions only
  - separation between adapter, store, and UI layers
- Design system:
  - CSS design tokens
  - custom typography
  - focus-visible treatment
  - motion polish
  - shadcn-compatible utility primitives in `src/components/ui`

## Intentionally Out Of Scope

- Backend services
- API routes
- auth
- database work
- middleware
- websocket / SSE / WebRTC transport implementation
- voice agent, speech-to-text, or orchestration logic
- mocked graph data, fake streams, timers, or demo event playback

## Architecture

### UI Layer

- [`src/features/workspace/components/workspace-shell.tsx`](./src/features/workspace/components/workspace-shell.tsx): top-level workspace composition
- [`src/features/workspace/components/top-bar.tsx`](./src/features/workspace/components/top-bar.tsx): status chips and layout controls
- [`src/features/graph/components/graph-canvas.tsx`](./src/features/graph/components/graph-canvas.tsx): React Flow wiring and canvas empty state
- [`src/features/activity/components/activity-panel.tsx`](./src/features/activity/components/activity-panel.tsx): transcript/activity empty state

### Graph Domain Layer

- [`src/features/graph/types/graph.ts`](./src/features/graph/types/graph.ts): typed nodes, edges, layout directions, and React Flow builders
- [`src/features/graph/lib/layout-graph.ts`](./src/features/graph/lib/layout-graph.ts): Dagre layout utility
- [`src/features/graph/store/graph-store.ts`](./src/features/graph/store/graph-store.ts): Zustand state and graph actions

### Realtime Boundary

- [`src/features/graph/contracts/inbound-graph-events.ts`](./src/features/graph/contracts/inbound-graph-events.ts): strict inbound event schemas and TS types
- [`src/features/realtime/graph-event-adapter.ts`](./src/features/realtime/graph-event-adapter.ts): adapter interface signatures only

## Folder Tree

```text
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── scroll-area.tsx
│       └── separator.tsx
├── features/
│   ├── activity/
│   │   └── components/
│   │       └── activity-panel.tsx
│   ├── graph/
│   │   ├── components/
│   │   │   ├── category-node.tsx
│   │   │   ├── graph-canvas.tsx
│   │   │   ├── graph-node-card.tsx
│   │   │   ├── idea-node.tsx
│   │   │   └── insight-node.tsx
│   │   ├── contracts/
│   │   │   └── inbound-graph-events.ts
│   │   ├── lib/
│   │   │   └── layout-graph.ts
│   │   ├── store/
│   │   │   └── graph-store.ts
│   │   └── types/
│   │       └── graph.ts
│   ├── realtime/
│   │   └── graph-event-adapter.ts
│   └── workspace/
│       └── components/
│           ├── top-bar.tsx
│           └── workspace-shell.tsx
├── lib/
│   └── utils.ts
├── routes/
│   ├── __root.tsx
│   └── index.tsx
└── styles.css
```

## Realtime Event Contract

Inbound events are validated with Zod before they should touch the store. Supported event types:

- `graph.node.upsert`
- `graph.node.remove`
- `graph.edge.upsert`
- `graph.edge.remove`
- `graph.layout`
- `graph.reset`

Each event uses a strict envelope:

```ts
{
  version: 1
  eventId: string
  occurredAt: string // ISO datetime
}
```

Node payloads support:

- `id`
- `kind`: `idea | category | insight`
- `label`
- optional `summary`
- optional `emphasis`

Edge payloads support:

- `id`
- `source`
- `target`
- `kind`: `association | hierarchy | reference`
- optional `label`

## Adapter Boundary

The transport is intentionally not implemented. External integrations should conform to [`src/features/realtime/graph-event-adapter.ts`](./src/features/realtime/graph-event-adapter.ts):

```ts
interface GraphEventAdapter {
  readonly name: string
  connect(): Promise<void> | void
  disconnect(): Promise<void> | void
  subscribe(listener: GraphEventListener): () => void
}
```

Expected flow:

1. External voice pipeline emits graph delta events.
2. Adapter validates/parses them with the Zod contracts.
3. Adapter forwards typed events into the Zustand store.
4. Store mutates graph state and triggers Dagre layout when needed.
5. React Flow re-renders the canvas with the updated nodes and edges.

## Notes

- The graph starts empty by design.
- The activity panel is an empty state by design.
- No transport, no demo data, and no fake event source are included.
- `npm run build` succeeds against the current scaffold.
