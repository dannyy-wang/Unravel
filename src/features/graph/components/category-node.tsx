import type { NodeProps } from '@xyflow/react'
import { Grid2x2 } from 'lucide-react'

import { GraphNodeCard } from '#/features/graph/components/graph-node-card'
import type { GraphNode } from '#/features/graph/types/graph'

export function CategoryNode(props: NodeProps<GraphNode>) {
  return (
    <GraphNodeCard
      {...props}
      icon={Grid2x2}
      label="Category cluster"
      tone="var(--category)"
    />
  )
}
