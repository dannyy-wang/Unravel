import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Mic } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { GraphCanvas } from '#/features/graph/components/graph-canvas'
import { useGraphStore } from '#/features/graph/store/graph-store'
import { useVoiceSession } from '#/voice/client/useVoiceSession'

type CtaState = 'centered-idle' | 'docked-idle' | 'docked-recording'

export function WorkspaceShell() {
  const [ctaState, setCtaState] = useState<CtaState>('centered-idle')
  const isDocked = ctaState !== 'centered-idle'
  const isRecording = ctaState === 'docked-recording'

  const applyEvent = useGraphStore((state) => state.applyEvent)
  const setConnectionStatus = useGraphStore((state) => state.setConnectionStatus)

  // Voice session hook
  const { status, connect, disconnect, getAdapter } = useVoiceSession({
    onStatusChange: (s) => {
      if (s === 'connected') setConnectionStatus('connected')
      else if (s === 'connecting') setConnectionStatus('connecting')
      else setConnectionStatus('unbound')
    },
  })

  // Subscribe the adapter to the graph store when connected
  useEffect(() => {
    const adapter = getAdapter()
    if (!adapter || status !== 'connected') return

    const unsubGraph = adapter.subscribe(applyEvent)
    return () => { unsubGraph() }
  }, [status, getAdapter, applyEvent])

  const handleButtonClick = useCallback(async () => {
    if (ctaState === 'centered-idle') {
      // Start session
      setCtaState('docked-recording')
      try {
        await connect()
      } catch {
        setCtaState('centered-idle')
      }
      return
    }

    if (ctaState === 'docked-recording') {
      // Stop session
      setCtaState('docked-idle')
      await disconnect()
    } else {
      // Resume session
      setCtaState('docked-recording')
      try {
        await connect()
      } catch {
        setCtaState('docked-idle')
      }
    }
  }, [ctaState, connect, disconnect])

  return (
    <main id="main-content" className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.2, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <GraphCanvas className="h-screen rounded-none" />
      </motion.div>

      <motion.div
        layout
        className={cn(
          'pointer-events-none absolute inset-0 flex justify-center px-6 sm:px-8',
          isDocked ? 'items-end pb-6 sm:pb-8' : 'items-center',
        )}
        transition={{
          layout: {
            duration: 0.72,
            ease: [0.2, 1, 0.3, 1],
          },
        }}
      >
        <motion.div
          layout
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
            ease: [0.2, 1, 0.3, 1],
            layout: {
              duration: 0.72,
              ease: [0.2, 1, 0.3, 1],
            },
          }}
          className="pointer-events-auto"
        >
          <Button
            size="lg"
            onClick={handleButtonClick}
            aria-pressed={isRecording}
            className={cn(
              'h-10 rounded-full border-[rgba(162,78,43,0.24)] text-[0.82rem] font-medium tracking-[0.04em] shadow-[0_18px_34px_rgba(126,80,56,0.14)]',
              isRecording ? 'relative min-w-[12.5rem] justify-center px-5' : 'px-4.5',
            )}
          >
            {isRecording ? (
              <>
                <span aria-hidden="true" className="recording-leading recording-leading--absolute">
                  <span className="recording-dot" />
                </span>
                <Waveform />
                <span className="sr-only">listening</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="recording-leading">
                  <Mic />
                </span>
                {isDocked ? 'resume' : 'start yapping'}
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  )
}

function Waveform() {
  return (
    <span className="recording-wave" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, index) => (
        <span
          key={index}
          className="recording-wave__bar"
          style={{ animationDelay: `${index * 95}ms` }}
        />
      ))}
    </span>
  )
}
