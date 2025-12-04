import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OCPPClient } from './OCPPClient';
import type { IConnection } from '../interfaces/IConnection';

class MockConnection implements IConnection {
  connect = vi.fn();
  send = vi.fn();
  close = vi.fn();
  onOpen: (() => void) | null = null;
  onMessage: ((data: any) => void) | null = null;
  onClose: (() => void) | null = null;
  onError: ((error: any) => void) | null = null;
}

describe('OCPPClient', () => {
  let client: OCPPClient;
  let mockConnection: MockConnection;

  beforeEach(() => {
    mockConnection = new MockConnection();
    client = new OCPPClient('ws://localhost:9000', 'CP001', mockConnection);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to the correct URL', () => {
    client.connect();
    expect(mockConnection.connect).toHaveBeenCalledWith('ws://localhost:9000/CP001', 'ocpp1.6');
  });

  it('should send BootNotification on open', () => {
    client.connect();
    
    // Simulate onopen
    if (mockConnection.onOpen) {
        mockConnection.onOpen();
    }
    
    expect(mockConnection.send).toHaveBeenCalled();
    const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
    expect(sentMessage[2]).toBe('BootNotification');
  });
});
