/**
 * Timer Utility
 * Manages call duration tracking
 */
export class Timer {
  constructor(onTick) {
    this.duration = 0;
    this.interval = null;
    this.onTick = onTick;
  }

  start() {
    this.duration = 0;
    if (this.onTick) {
      this.onTick(this.duration);
    }

    this.interval = setInterval(() => {
      this.duration++;
      if (this.onTick) {
        this.onTick(this.duration);
      }
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.duration = 0;
    if (this.onTick) {
      this.onTick(this.duration);
    }
  }

  getDuration() {
    return this.duration;
  }
}
