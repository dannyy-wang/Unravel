import type { LucideIcon } from 'lucide-react'
import {
  AudioLines,
  GitBranchPlus,
  LayoutPanelLeft,
  RefreshCcw,
  Rows3,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type {
  GraphConnectionStatus,
  GraphLayoutDirection,
} from '#/features/graph/types/graph'

interface TopBarProps {
  connectionStatus: GraphConnectionStatus
  layoutDirection: GraphLayoutDirection
  nodeCount: number
  edgeCount: number
  activityPanelOpen: boolean
  onLayoutDirectionChange: (direction: GraphLayoutDirection) => void
  onRelayout: () => void
  onToggleActivityPanel: () => void
}

const statusToneMap: Record<GraphConnectionStatus, string> = {
  unbound: 'text-[var(--ink-dim)]',
  connecting: 'text-[var(--signal-strong)]',
  connected: 'text-[var(--accent)]',
  error: 'text-[var(--danger)]',
}

export function TopBar({
  connectionStatus,
  layoutDirection,
  nodeCount,
  edgeCount,
  activityPanelOpen,
  onLayoutDirectionChange,
  onRelayout,
  onToggleActivityPanel,
}: TopBarProps) {
  return (
    <header className="panel-surface relative overflow-hidden rounded-[2rem] px-5 py-5 sm:px-6">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(242,182,109,0.16),transparent_58%)]" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow mb-3">Unravel workspace</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="display-title text-4xl leading-none text-[var(--ink)] sm:text-5xl">
                Voice-native thought cartography.
              </h1>
              <span className="rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--signal-strong)]">
                frontend scaffold
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-soft)] sm:text-base">
              Built to receive validated graph deltas from an external voice
              pipeline and reorganize the canvas in real time without coupling
              transport code into the UI layer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[25rem]">
            <StatusChip
              icon={AudioLines}
              label="Adapter"
              value={connectionStatus}
              valueClassName={statusToneMap[connectionStatus]}
            />
            <StatusChip
              icon={GitBranchPlus}
              label="Graph"
              value={`${nodeCount} nodes / ${edgeCount} edges`}
            />
            <StatusChip
              icon={Rows3}
              label="Layout"
              value={
                layoutDirection === 'TB' ? 'vertical flow' : 'horizontal flow'
              }
            />
            <StatusChip
              icon={LayoutPanelLeft}
              label="Activity"
              value={activityPanelOpen ? 'panel open' : 'panel collapsed'}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={layoutDirection === 'TB' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLayoutDirectionChange('TB')}
          >
            <Rows3 />
            Vertical layout
          </Button>
          <Button
            variant={layoutDirection === 'LR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLayoutDirectionChange('LR')}
          >
            <GitBranchPlus />
            Horizontal layout
          </Button>
          <Button variant="outline" size="sm" onClick={onRelayout}>
            <RefreshCcw />
            Re-layout graph
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleActivityPanel}>
            <LayoutPanelLeft />
            {activityPanelOpen ? 'Hide activity' : 'Show activity'}
          </Button>
        </div>
      </div>
    </header>
  )
}

interface StatusChipProps {
  icon: LucideIcon
  label: string
  value: string
  valueClassName?: string
}

function StatusChip({
  icon: Icon,
  label,
  value,
  valueClassName,
}: StatusChipProps) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/4 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-[var(--ink-dim)]">
        <Icon className="size-4" />
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <p className={cn('text-sm font-medium text-[var(--ink-soft)]', valueClassName)}>
        {value}
      </p>
    </div>
  )
}
