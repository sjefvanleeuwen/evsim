import type { IConnection } from '../../interfaces/IConnection';
import { SimulatedCSMS } from './SimulatedCSMS';

export class SimulatedConnection implements IConnection {
  public onOpen: (() => void) | null = null;
  public onMessage: ((data: any) => void) | null = null;
  public onClose: (() => void) | null = null;
  public onError: ((error: any) => void) | null = null;

  private csms: SimulatedCSMS;
  private chargePointId: string = '';

  constructor() {
    this.csms = SimulatedCSMS.getInstance();
  }

  connect(url: string, _protocol: string): void {
    // Extract CP ID from URL (e.g., ws://localhost:9000/CP001)
    const parts = url.split('/');
    this.chargePointId = parts[parts.length - 1];

    console.log(`[SimConnection] Connecting ${this.chargePointId} to Simulated CSMS...`);

    // Simulate network delay
    setTimeout(() => {
      this.csms.registerConnection(this.chargePointId, this);
      if (this.onOpen) this.onOpen();
    }, 500);
  }

  send(data: string): void {
    // Simulate network delay
    setTimeout(() => {
      this.csms.handleMessage(this.chargePointId, data);
    }, 100);
  }

  close(): void {
    this.csms.closeConnection(this.chargePointId);
    if (this.onClose) this.onClose();
  }

  // Method for CSMS to send data back to client
  receive(data: string): void {
    if (this.onMessage) {
      this.onMessage({ data });
    }
  }
}
