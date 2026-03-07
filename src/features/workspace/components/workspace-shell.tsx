import { useState } from 'react'
import { motion } from 'motion/react'

import { ActivityPanel } from '#/features/activity/components/activity-panel'
import { GraphCanvas } from '#/features/graph/components/graph-canvas'
import { useGraphStore } from '#/features/graph/store/graph-store'
import { TopBar } from '#/features/workspace/components/top-bar'

export function WorkspaceShell() {
  const [activityPanelOpen, setActivityPanelOpen] = useState(true)
  const nodeCount = useGraphStore((state) => state.nodes.length)
  const edgeCount = useGraphStore((state) => state.edges.length)
  const connectionStatus = useGraphStore((state) => state.connectionStatus)
  const layoutDirection = useGraphStore((state) => state.layoutDirection)
  const triggerLayout = useGraphStore((state) => state.triggerLayout)

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-5 sm:py-5 lg:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 1, 0.3, 1] }}
      >
        <TopBar
          connectionStatus={connectionStatus}
          layoutDirection={layoutDirection}
          nodeCount={nodeCount}
          edgeCount={edgeCount}
          activityPanelOpen={activityPanelOpen}
          onLayoutDirectionChange={(direction) => triggerLayout(direction)}
          onRelayout={() => triggerLayout()}
          onToggleActivityPanel={() => setActivityPanelOpen((current) => !current)}
        />
      </motion.div>

      <div className="grid min-h-[calc(100vh-15rem)] gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.2, 1, 0.3, 1] }}
          className="panel-surface relative flex min-h-[32rem] flex-col overflow-hidden rounded-[2rem]"
          aria-labelledby="graph-canvas-heading"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5">
            <div>
              <p className="eyebrow mb-2">Realtime graph</p>
              <h2
                id="graph-canvas-heading"
                className="display-title text-[1.65rem] text-[var(--ink)]"
              >
                Canvas for live ideation structure.
              </h2>
            </div>
            <p className="max-w-xs text-right font-mono text-xs leading-5 text-[var(--ink-dim)]">
              Node kinds: idea, category, insight. Layout engine: dagre.
            </p>
          </div>
          <GraphCanvas className="flex-1" />
        </motion.section>

        {activityPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.12,
              ease: [0.2, 1, 0.3, 1],
            }}
          >
            <ActivityPanel className="h-full" />
          </motion.div>
        ) : null}
      </div>
    </main>
  )
}
