export const convertToAudioSource = async (context: AudioContext, audioBuffer: ArrayBuffer) => {
  const source = context.createBufferSource()
  const decodedAudio = await context.decodeAudioData(audioBuffer)
  source.buffer = decodedAudio
  return source
}
