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

/**
 * Find connected components in the graph.
 * Returns an array of sets, each containing node IDs in the same component.
 */
function findConnectedComponents(
  nodeIds: string[],
  edges: GraphEdge[],
): Set<string>[] {
  const parent = new Map<string, string>()
  for (const id of nodeIds) parent.set(id, id)

  function find(a: string): string {
    while (parent.get(a) !== a) {
      parent.set(a, parent.get(parent.get(a)!)!)
      a = parent.get(a)!
    }
    return a
  }

  function union(a: string, b: string) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const edge of edges) {
    if (parent.has(edge.source) && parent.has(edge.target)) {
      union(edge.source, edge.target)
    }
  }

  const components = new Map<string, Set<string>>()
  for (const id of nodeIds) {
    const root = find(id)
    if (!components.has(root)) components.set(root, new Set())
    components.get(root)!.add(id)
  }

  return [...components.values()]
}

/**
 * Layout a connected component using Dagre (tree layout).
 */
function layoutComponent(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: GraphLayoutDirection,
  nodeSeparation: number,
  rankSeparation: number,
): Map<string, { x: number; y: number }> {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

  graph.setGraph({
    rankdir: direction,
    align: 'UL',
    nodesep: nodeSeparation,
    ranksep: rankSeparation,
    marginx: 0,
    marginy: 0,
  })

  for (const n of nodes) {
    graph.setNode(n.id, graphNodeDimensions[n.type as GraphNodeKind])
  }

  for (const e of edges) {
    graph.setEdge(e.source, e.target)
  }

  dagre.layout(graph)

  const positions = new Map<string, { x: number; y: number }>()
  for (const n of nodes) {
    const dim = graphNodeDimensions[n.type as GraphNodeKind]
    const pos = graph.node(n.id)
    positions.set(n.id, {
      x: pos.x - dim.width / 2,
      y: pos.y - dim.height / 2,
    })
  }

  return positions
}

export function layoutGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  { direction, nodeSeparation = 60, rankSeparation = 100 }: GraphLayoutOptions,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (nodes.length === 0) return { nodes, edges }

  const isHorizontal = direction === 'LR'
  const nodeIds = nodes.map((n) => n.id)
  const components = findConnectedComponents(nodeIds, edges)

  const allPositions = new Map<string, { x: number; y: number }>()

  // Layout each connected component independently, then arrange components
  // in a grid to prevent overlap
  const componentBounds: { component: Set<string>; width: number; height: number }[] = []

  for (const component of components) {
    const compNodes = nodes.filter((n) => component.has(n.id))
    const compEdges = edges.filter(
      (e) => component.has(e.source) && component.has(e.target),
    )

    if (compNodes.length === 1) {
      // Single node — just position at origin, we'll offset later
      const dim = graphNodeDimensions[compNodes[0].type as GraphNodeKind]
      allPositions.set(compNodes[0].id, { x: 0, y: 0 })
      componentBounds.push({ component, width: dim.width, height: dim.height })
    } else {
      // Multi-node component — use Dagre
      const positions = layoutComponent(
        compNodes,
        compEdges,
        direction,
        nodeSeparation,
        rankSeparation,
      )

      // Calculate bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const node of compNodes) {
        const pos = positions.get(node.id)!
        const dim = graphNodeDimensions[node.type as GraphNodeKind]
        minX = Math.min(minX, pos.x)
        minY = Math.min(minY, pos.y)
        maxX = Math.max(maxX, pos.x + dim.width)
        maxY = Math.max(maxY, pos.y + dim.height)
      }

      // Normalize positions to start at (0, 0)
      for (const node of compNodes) {
        const pos = positions.get(node.id)!
        allPositions.set(node.id, { x: pos.x - minX, y: pos.y - minY })
      }

      componentBounds.push({
        component,
        width: maxX - minX,
        height: maxY - minY,
      })
    }
  }

  // Arrange components in a grid with generous spacing
  const GAP = 120
  let cursorX = 0
  let cursorY = 0
  let rowMaxHeight = 0
  const MAX_ROW_WIDTH = 1200

  for (const { component, width, height } of componentBounds) {
    if (cursorX > 0 && cursorX + width > MAX_ROW_WIDTH) {
      // Wrap to next row
      cursorX = 0
      cursorY += rowMaxHeight + GAP
      rowMaxHeight = 0
    }

    // Offset all nodes in this component
    for (const nodeId of component) {
      const pos = allPositions.get(nodeId)!
      allPositions.set(nodeId, {
        x: pos.x + cursorX,
        y: pos.y + cursorY,
      })
    }

    cursorX += width + GAP
    rowMaxHeight = Math.max(rowMaxHeight, height)
  }

  return {
    nodes: nodes.map((node) => {
      const pos = allPositions.get(node.id) ?? node.position
      return {
        ...node,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        position: pos,
      }
    }),
    edges,
  }
}
