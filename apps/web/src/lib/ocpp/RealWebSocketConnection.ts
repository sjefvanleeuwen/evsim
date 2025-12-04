import type { IConnection } from '../interfaces/IConnection';

export class RealWebSocketConnection implements IConnection {
  private ws: WebSocket | null = null;
  
  public onOpen: (() => void) | null = null;
  public onMessage: ((data: any) => void) | null = null;
  public onClose: (() => void) | null = null;
  public onError: ((error: any) => void) | null = null;

  connect(url: string, protocol: string): void {
    this.ws = new WebSocket(url, protocol);

    this.ws.onopen = () => {
      if (this.onOpen) this.onOpen();
    };

    this.ws.onmessage = (event) => {
      if (this.onMessage) this.onMessage(event);
    };

    this.ws.onclose = () => {
      if (this.onClose) this.onClose();
    };

    this.ws.onerror = (error) => {
      if (this.onError) this.onError(error);
    };
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn("WebSocket is not open");
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
