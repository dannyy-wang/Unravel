import '@xyflow/react/dist/style.css'

import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'

import { cn } from '#/lib/utils'
import { CategoryNode } from '#/features/graph/components/category-node'
import { IdeaNode } from '#/features/graph/components/idea-node'
import { InsightNode } from '#/features/graph/components/insight-node'
import { useGraphStore } from '#/features/graph/store/graph-store'

const nodeTypes = {
  idea: IdeaNode,
  category: CategoryNode,
  insight: InsightNode,
}

interface GraphCanvasProps {
  className?: string
}

export function GraphCanvas({ className }: GraphCanvasProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div
      className={cn(
        'relative h-full min-h-[24rem] overflow-hidden rounded-[1.8rem]',
        className
      )}
    >
      <div className="panel-grid absolute inset-0 opacity-70" />
      {isClient ? (
        <ReactFlowProvider>
          <GraphCanvasInner />
        </ReactFlowProvider>
      ) : (
        <CanvasFallback />
      )}
    </div>
  )
}

function GraphCanvasInner() {
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const onNodesChange = useGraphStore((state) => state.onNodesChange)
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange)
  const lastEventAt = useGraphStore((state) => state.lastEventAt)
  const reactFlow = useReactFlow()

  useEffect(() => {
    if (!lastEventAt || nodes.length === 0) {
      return
    }

    void reactFlow.fitView({
      duration: 450,
      padding: 0.18,
    })
  }, [lastEventAt, nodes.length, reactFlow])

  const empty = nodes.length === 0
  const countLabel = useMemo(
    () => `${nodes.length} nodes / ${edges.length} edges`,
    [edges.length, nodes.length]
  )

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.35}
        maxZoom={1.8}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background
          color="var(--grid-minor)"
          gap={28}
          size={1}
          variant={BackgroundVariant.Lines}
        />
        <Controls showInteractive={false} position="bottom-left" />
        <Panel position="top-right">
          <div className="panel-surface rounded-2xl px-4 py-3 text-right">
            <p className="eyebrow mb-2">Canvas telemetry</p>
            <p className="font-mono text-xs text-[var(--ink-soft)]">
              {countLabel}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-dim)]">
              {lastEventAt
                ? `last delta ${new Date(lastEventAt).toLocaleTimeString()}`
                : 'no deltas received yet'}
            </p>
          </div>
        </Panel>
      </ReactFlow>
      {empty ? <CanvasEmptyState /> : null}
    </>
  )
}

function CanvasFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="panel-surface rounded-[1.6rem] px-6 py-5 text-center">
        <p className="eyebrow mb-2">Graph canvas</p>
        <p className="text-sm text-[var(--ink-soft)]">
          Hydrating React Flow workspace…
        </p>
      </div>
    </div>
  )
}

function CanvasEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
      <div className="panel-surface max-w-md rounded-[1.8rem] p-6 text-center">
        <p className="eyebrow mb-3">Ready for inbound deltas</p>
        <h2 className="display-title text-3xl text-[var(--ink)]">
          The graph is waiting for your first thought cluster.
        </h2>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
          Attach a real adapter that emits validated graph events and the store
          will create, update, remove, and re-layout nodes as speech is
          structured upstream.
        </p>
      </div>
    </div>
  )
}
