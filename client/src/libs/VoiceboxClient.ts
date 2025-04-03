export class VoiceboxClient {
  private _speaker: number = 1 // ずんだもん

  constructor () {}

  audioQuery = async (text: string) =>{
    const queryParams = `?text=${encodeURIComponent(text)}&speaker=${this._speaker}`
    const res = await fetch(`http://127.0.0.1:50021/audio_query${queryParams}`, {
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
    const res = await fetch(`http://127.0.0.1:50021/synthesis${queryParams}`, {
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
    const audioSource = await this._convertToAudioSource(arrayBuffer)
    return audioSource
  }

  private _convertToAudioSource = async (audioBuffer: ArrayBuffer) => {
    const context = new AudioContext()
    const source = context.createBufferSource()
    const decodedAudio = await context.decodeAudioData(audioBuffer)
    source.buffer = decodedAudio
    source.connect(context.destination)
    return source
  }
}