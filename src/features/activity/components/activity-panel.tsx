import { RadioTower, ScrollText } from 'lucide-react'

import { ScrollArea } from '#/components/ui/scroll-area'
import { Separator } from '#/components/ui/separator'

interface ActivityPanelProps {
  className?: string
}

export function ActivityPanel({ className }: ActivityPanelProps) {
  return (
    <aside className={className} aria-labelledby="activity-panel-heading">
      <div className="panel-surface flex h-full min-h-[18rem] flex-col rounded-[1.8rem]">
        <div className="flex items-start justify-between gap-4 px-5 py-5">
          <div>
            <p className="eyebrow mb-2">Live transcript / activity</p>
            <h2
              id="activity-panel-heading"
              className="display-title text-[1.55rem] text-[var(--ink)]"
            >
              Incoming voice context lands here.
            </h2>
          </div>
          <span className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--signal-strong)]">
            <ScrollText />
          </span>
        </div>
        <Separator />
        <ScrollArea className="activity-scroll min-h-0 flex-1 px-5 py-5">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line-strong)] bg-white/4 p-5">
              <div className="mb-3 inline-flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--accent)]">
                <RadioTower />
              </div>
              <h3 className="text-base font-semibold text-[var(--ink)]">
                No transcript frames yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                The UI is scaffolded for a live activity stream, but this panel
                intentionally stays empty until a real transport adapter begins
                publishing transcript and graph delta events.
              </p>
            </div>
            <p className="font-mono text-xs leading-6 text-[var(--ink-dim)]">
              Expected upstream responsibilities: speech-to-text, turn
              segmentation, entity extraction, graph delta emission, and
              connection orchestration.
            </p>
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
