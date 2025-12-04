export class SimulationClock {
  private static instance: SimulationClock;
  private speedFactor: number = 100;
  private startTime: number;
  private virtualStartTime: number;
  private listeners: ((virtualTime: Date) => void)[] = [];
  private intervalId: number | null = null;

  private constructor() {
    this.startTime = Date.now();
    
    // Start at 04:00 AM local time (Low traffic period)
    const start = new Date();
    start.setHours(4, 0, 0, 0);
    this.virtualStartTime = start.getTime();
    
    // Default start (will be overridden if worker drives it)
    this.start();
  }

  public static getInstance(): SimulationClock {
    if (!SimulationClock.instance) {
      SimulationClock.instance = new SimulationClock();
    }
    return SimulationClock.instance;
  }

  public setTime(time: Date) {
      // If externally driven, stop internal loop
      this.stop();
      this.virtualStartTime = time.getTime(); // Sync for reference
      this.listeners.forEach(l => l(time));
  }

  public start() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      this.notifyListeners();
    }, 1000); // Update UI every second
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getVirtualTime(): Date {
    const realElapsed = Date.now() - this.startTime;
    const virtualElapsed = realElapsed * this.speedFactor;
    return new Date(this.virtualStartTime + virtualElapsed);
  }

  public subscribe(listener: (virtualTime: Date) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const time = this.getVirtualTime();
    this.listeners.forEach(l => l(time));
  }
}
