/**
 * Audio Manager for preloading and caching audio files
 */
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Preload audio files into memory for instant playback
   */
  preloadAudio(audioFiles: string[]) {
    audioFiles.forEach(file => {
      if (!this.audioCache.has(file)) {
        const audio = new Audio(`/${file}`);
        audio.preload = 'auto';
        audio.load(); // Force immediate loading
        this.audioCache.set(file, audio);
      }
    });
  }

  /**
   * Play audio with instant response
   */
  play(audioFile: string, playbackRate: number = 1.5) {
    // Stop current audio immediately
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // Get from cache or create new
    let audio = this.audioCache.get(audioFile);
    
    if (!audio) {
      audio = new Audio(`/${audioFile}`);
      audio.preload = 'auto';
      this.audioCache.set(audioFile, audio);
    }

    // Reset and configure
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    
    // Play immediately
    this.currentAudio = audio;
    audio.play().catch(error => {
      console.error("Audio playback failed:", error);
    });
  }

  /**
   * Stop any currently playing audio
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.audioCache.clear();
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
