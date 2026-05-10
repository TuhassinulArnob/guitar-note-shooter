import Pitchfinder from 'pitchfinder'

const detectPitch = Pitchfinder.YIN()

export async function startPitchDetection(onNoteDetected) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  })

// getUserMedia({
//   audio: {
//     echoCancellation: false,
//     noiseSuppression: false,
//     autoGainControl: false
//   }
// }) for better...  only

  const audioContext = new AudioContext()

  const source = audioContext.createMediaStreamSource(stream)

  const analyser = audioContext.createAnalyser()

  analyser.fftSize = 2048

  source.connect(analyser)

  const buffer = new Float32Array(analyser.fftSize)

  function update() {
    analyser.getFloatTimeDomainData(buffer)

// Calculate volume
let sum = 0

for (let i = 0; i < buffer.length; i++) {
  sum += buffer[i] * buffer[i]
}

const volume = Math.sqrt(
  sum / buffer.length
)

// Ignore silence/noise
if (volume < 0.01) {
  requestAnimationFrame(update)
  return
}

const pitch = detectPitch(
  buffer,
  audioContext.sampleRate
)

if (
  pitch &&
  pitch > 60 &&
  pitch < 1200
) {
      const result =
  frequencyToNote(pitch)

onNoteDetected(
  result.note,
  pitch,
  result.cents
)
    }

    requestAnimationFrame(update)
  }

  update()
}
function frequencyToNote(freq) {
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
  ]

  const noteNum =
    Math.round(
      12 *
        Math.log2(freq / 440) +
        69
    ) + 1

  const note =
    noteNames[noteNum % 12]

  // exact frequency of nearest note
  const reference =
    440 *
    Math.pow(
      2,
      (noteNum - 69) / 12
    )

  // cents difference
  const cents =
    1200 *
    Math.log2(freq / reference)

  return {
    note,
    cents
  }
}