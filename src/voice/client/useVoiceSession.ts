import { useState, useCallback, useRef } from 'react'
import {
  WsSessionAdapter,
  type WsSessionAdapterCallbacks,
} from '#/features/realtime/ws-session-adapter'
import type { VoiceSessionStatus, VoiceSessionCallbacks } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export function useVoiceSession(callbacks?: VoiceSessionCallbacks) {
  const [status, setStatus] = useState<VoiceSessionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const adapterRef = useRef<WsSessionAdapter | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const updateStatus = useCallback(
    (newStatus: VoiceSessionStatus) => {
      setStatus(newStatus)
      callbacks?.onStatusChange?.(newStatus)
    },
    [callbacks],
  )

  const connect = useCallback(
    async (topic?: string) => {
      updateStatus('connecting')

      try {
        // 1. Create session via REST
        const res = await fetch(`${API_BASE}/api/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        })
        if (!res.ok) throw new Error('Failed to create session')
        const { sessionId } = await res.json()
        sessionIdRef.current = sessionId

        // 2. Create and connect WebSocket adapter
        const adapterCallbacks: WsSessionAdapterCallbacks = {
          onTranscript: (data) => {
            callbacks?.onEvent?.({
              type: 'transcript',
              timestamp: Date.now(),
              data,
            })
          },
          onAiResponse: (text) => {
            callbacks?.onEvent?.({
              type: 'agent_state_change',
              timestamp: Date.now(),
              data: { response: text },
            })
          },
          onError: (message) => {
            callbacks?.onEvent?.({
              type: 'error',
              timestamp: Date.now(),
              data: { error: message },
            })
          },
        }

        const adapter = new WsSessionAdapter(sessionId, adapterCallbacks)
        adapterRef.current = adapter
        await adapter.connect()

        // 3. Get microphone and start streaming audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        })
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            adapter.sendAudio(e.data)
          }
        }
        recorder.start(100) // 100ms chunks
        mediaRecorderRef.current = recorder

        updateStatus('connected')
      } catch (error) {
        callbacks?.onEvent?.({
          type: 'error',
          timestamp: Date.now(),
          data: { error: String(error) },
        })
        updateStatus('disconnected')
        throw error
      }
    },
    [updateStatus, callbacks],
  )

  const disconnect = useCallback(async () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    // Close mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    // Disconnect WebSocket adapter
    if (adapterRef.current) {
      adapterRef.current.disconnect()
      adapterRef.current = null
    }

    // Delete session via REST
    if (sessionIdRef.current) {
      try {
        await fetch(`${API_BASE}/api/session/${sessionIdRef.current}`, {
          method: 'DELETE',
        })
      } catch {
        // Best-effort cleanup
      }
      sessionIdRef.current = null
    }

    setIsMuted(false)
    updateStatus('disconnected')
  }, [updateStatus])

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const newMuted = !isMuted
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted
      })
      setIsMuted(newMuted)
    }
  }, [isMuted])

  /** Expose the adapter so parent components can subscribe to graph events */
  const getAdapter = useCallback(() => adapterRef.current, [])

  return {
    status,
    isMuted,
    connect,
    disconnect,
    toggleMute,
    getAdapter,
  }
}
