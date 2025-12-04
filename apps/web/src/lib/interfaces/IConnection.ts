export interface IConnection {
  connect(url: string, protocol: string): void;
  send(data: string): void;
  close(): void;
  onOpen: (() => void) | null;
  onMessage: ((data: any) => void) | null;
  onClose: (() => void) | null;
  onError: ((error: any) => void) | null;
}

export interface IOCPPMessage {
  messageTypeId: number;
  messageId: string;
  action?: string;
  payload?: any;
  errorCode?: string;
  errorDescription?: string;
  errorDetails?: any;
}
