import { WebSocket } from 'ws'

export interface DeepgramTranscriptResult {
  type: 'transcript'
  transcript: string
  is_final: boolean
  speech_final: boolean
}

export interface DeepgramUtteranceEnd {
  type: 'utterance_end'
}

export type DeepgramEvent = DeepgramTranscriptResult | DeepgramUtteranceEnd

export interface DeepgramServiceOptions {
  apiKey: string
  onEvent: (event: DeepgramEvent) => void
  onError: (error: Error) => void
  onClose: () => void
}

export class DeepgramService {
  private dgWs: WebSocket | null = null
  private options: DeepgramServiceOptions

  constructor(options: DeepgramServiceOptions) {
    this.options = options
  }

  connect(): void {
    const params = new URLSearchParams({
      model: 'nova-3',
      language: 'en',
      smart_format: 'true',
      interim_results: 'true',
      utterance_end_ms: '1000',
      vad_events: 'true',
      endpointing: '300',
    })

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`

    this.dgWs = new WebSocket(url, {
      headers: { Authorization: `Token ${this.options.apiKey}` },
    })

    this.dgWs.on('open', () => {
      console.log('[deepgram] Connected')
    })

    this.dgWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())

        if (msg.type === 'Results') {
          const transcript = msg.channel?.alternatives?.[0]?.transcript
          if (transcript) {
            this.options.onEvent({
              type: 'transcript',
              transcript,
              is_final: msg.is_final ?? false,
              speech_final: msg.speech_final ?? false,
            })
          }
        } else if (msg.type === 'UtteranceEnd') {
          this.options.onEvent({ type: 'utterance_end' })
        }
      } catch {
        // ignore parse errors
      }
    })

    this.dgWs.on('close', () => {
      console.log('[deepgram] Disconnected')
      this.options.onClose()
    })

    this.dgWs.on('error', (err) => {
      console.error('[deepgram] Error:', err.message)
      this.options.onError(err)
    })
  }

  sendAudio(data: Buffer): void {
    if (this.dgWs && this.dgWs.readyState === WebSocket.OPEN) {
      this.dgWs.send(data)
    }
  }

  disconnect(): void {
    if (this.dgWs) {
      this.dgWs.close()
      this.dgWs = null
    }
  }
}
