import type { NodeProps } from '@xyflow/react'
import { Lightbulb } from 'lucide-react'

import { GraphNodeCard } from '#/features/graph/components/graph-node-card'
import type { GraphNode } from '#/features/graph/types/graph'

export function IdeaNode(props: NodeProps<GraphNode>) {
  return (
    <GraphNodeCard
      {...props}
      icon={Lightbulb}
      label="Emergent idea"
      tone="var(--idea)"
    />
  )
}
