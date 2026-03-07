import dagre from '@dagrejs/dagre'
import { Position } from '@xyflow/react'

import {
  graphNodeDimensions,
  type GraphEdge,
  type GraphLayoutDirection,
  type GraphNode,
  type GraphNodeKind,
} from '#/features/graph/types/graph'

export interface GraphLayoutOptions {
  direction: GraphLayoutDirection
  nodeSeparation?: number
  rankSeparation?: number
}

export function layoutGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  {
    direction,
    nodeSeparation = 44,
    rankSeparation = 88,
  }: GraphLayoutOptions
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  const isHorizontal = direction === 'LR'

  graph.setGraph({
    rankdir: direction,
    align: 'UL',
    nodesep: nodeSeparation,
    ranksep: rankSeparation,
    marginx: 12,
    marginy: 12,
  })

  for (const node of nodes) {
    const dimensions = graphNodeDimensions[node.type as GraphNodeKind]

    graph.setNode(node.id, dimensions)
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  return {
    nodes: nodes.map((node) => {
      const dimensions = graphNodeDimensions[node.type as GraphNodeKind]
      const position = graph.node(node.id)

      return {
        ...node,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        position: {
          x: position.x - dimensions.width / 2,
          y: position.y - dimensions.height / 2,
        },
      }
    }),
    edges,
  }
}
