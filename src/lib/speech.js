// Thin wrapper around the browser's built-in Web Speech API.
// No API key, no backend, no cost - but browser support/quality varies
// (best in Chrome/Edge on Android & desktop; limited on iOS Safari).

export function speak(text, { rate = 1, pitch = 1 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel() // don't stack overlapping lines
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// Starts listening once and resolves with the transcript.
// Returns a stop() function you can call to cancel early.
export function listenOnce({ onResult, onError, onEnd } = {}) {
  const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionImpl) {
    onError?.('Speech recognition is not supported in this browser.')
    return () => {}
  }

  const recognition = new SpeechRecognitionImpl()
  recognition.lang = 'en-IN'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult?.(transcript)
  }
  recognition.onerror = (event) => onError?.(event.error)
  recognition.onend = () => onEnd?.()

  recognition.start()
  return () => recognition.stop()
}
