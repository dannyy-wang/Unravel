import {
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import type {
  GraphNode,
  GraphNodeData,
} from '#/features/graph/types/graph'

interface GraphNodeCardProps extends NodeProps<GraphNode> {
  icon: LucideIcon
  tone: string
  label: string
  data: GraphNodeData
}

export function GraphNodeCard({
  data,
  selected,
  sourcePosition,
  targetPosition,
  icon: Icon,
  tone,
  label,
}: GraphNodeCardProps) {
  return (
    <article
      className={cn(
        'w-[min(300px,72vw)] rounded-[1.5rem] border border-white/6 bg-[rgba(17,14,15,0.92)] p-4 text-left shadow-[0_30px_90px_rgba(0,0,0,0.38)] transition-transform duration-300',
        selected
          ? 'scale-[1.01] border-[color:var(--node-accent)] shadow-[0_0_0_1px_var(--node-accent),0_32px_90px_rgba(0,0,0,0.42)]'
          : 'hover:-translate-y-0.5'
      )}
    >
      <Handle
        type="target"
        position={targetPosition ?? Position.Top}
        className="!bg-[var(--node-accent)]"
      />
      <Handle
        type="source"
        position={sourcePosition ?? Position.Bottom}
        className="!bg-[var(--node-accent)]"
      />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">{label}</p>
          <h3 className="display-title text-[1.28rem] leading-tight text-[var(--ink)]">
            {data.label}
          </h3>
        </div>
        <span
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/5"
          style={{ color: tone }}
        >
          <Icon />
        </span>
      </div>
      <p className="min-h-12 text-sm leading-6 text-[var(--ink-soft)]">
        {data.summary ?? 'Waiting for a structured delta from the voice pipeline.'}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 font-mono text-[0.72rem] tracking-[0.22em] uppercase"
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--node-accent) 18%, transparent)',
            color: tone,
          }}
        >
          {data.kind}
        </span>
        <span className="font-mono text-xs text-[var(--ink-dim)]">
          emphasis {data.emphasis ?? 3}/5
        </span>
      </div>
    </article>
  )
}
