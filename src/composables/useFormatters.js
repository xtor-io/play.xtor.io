export function useFormatters() {
  function formatDuration(seconds) {
    if (seconds === null || seconds === undefined) {
      return 'LIVE'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  function formatQuality(quality) {
    if (quality === null || quality === undefined) {
      return 'Auto'
    }
    return `${quality}p`
  }

  return {
    formatDuration,
    formatQuality
  }
}
