export class VoiceboxClient {
  private _speaker: number = 1 // ずんだもん
  private _endpoint: string

  constructor (voiceboxEndpoint?: string) {
    this._endpoint = voiceboxEndpoint || 'http://127.0.0.1:50021'
  }

  audioQuery = async (text: string) =>{
    const queryParams = `?text=${encodeURIComponent(text)}&speaker=${this._speaker}`
    const res = await fetch(`${this._endpoint}/audio_query${queryParams}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
    })

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`)
    }

    return res.json()
  }

  synthesis = async (audioQuery: any) => {
    const queryParams = `?speaker=${this._speaker}`
    const res = await fetch(`${this._endpoint}/synthesis${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...audioQuery,
        speaker: this._speaker
      })
    })

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    return arrayBuffer
  }
}