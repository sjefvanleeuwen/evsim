import type { IApiClient } from '../interfaces/IApiClient';
import { SimulatedOCPIBackend } from '../simulation/backend/SimulatedOCPIBackend';

type TrafficCallback = (log: { dir: 'in' | 'out'; msg: string; protocol: string; standard: string }) => void;

export class SimulatedApiClient implements IApiClient {
  private static instance: SimulatedApiClient;
  private backend: SimulatedOCPIBackend;
  private trafficCallback: TrafficCallback | null = null;

  private constructor() {
    this.backend = SimulatedOCPIBackend.getInstance();
  }

  public static getInstance(): SimulatedApiClient {
    if (!SimulatedApiClient.instance) {
      SimulatedApiClient.instance = new SimulatedApiClient();
    }
    return SimulatedApiClient.instance;
  }

  public setTrafficCallback(cb: TrafficCallback) {
    this.trafficCallback = cb;
  }

  private logTraffic(dir: 'in' | 'out', msg: string) {
    if (this.trafficCallback) {
      this.trafficCallback({
        dir,
        msg,
        protocol: 'HTTPS',
        standard: 'OCPI 2.2.1'
      });
    }
  }

  async getLocations(): Promise<any[]> {
    this.logTraffic('out', 'GET /ocpi/cpo/2.2/locations');
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 200));
    const result = this.backend.getLocations();
    this.logTraffic('in', `200 OK (Count: ${result.length})`);
    return result;
  }

  async getTariffs(): Promise<any[]> {
    this.logTraffic('out', 'GET /ocpi/cpo/2.2/tariffs');
    await new Promise(resolve => setTimeout(resolve, 200));
    const result = this.backend.getTariffs();
    this.logTraffic('in', `200 OK (Count: ${result.length})`);
    return result;
  }

  async authorize(token: string): Promise<boolean> {
    this.logTraffic('out', `POST /ocpi/cpo/2.2/tokens/${token}/authorize`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = this.backend.authorizeToken(token);
    this.logTraffic('in', `200 OK { allowed: ${result ? 'ALLOWED' : 'BLOCKED'} }`);
    return result;
  }

  async putSession(sessionId: string, sessionData: any): Promise<void> {
    this.logTraffic('out', `PUT /ocpi/cpo/2.2/sessions/US/CPO/${sessionId}\n${JSON.stringify(sessionData, null, 2)}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = this.backend.updateSession(sessionId, sessionData);
    this.logTraffic('in', `200 OK ${JSON.stringify(response)}`);
  }

  async postCdr(cdrData: any): Promise<void> {
    this.logTraffic('out', `POST /ocpi/cpo/2.2/cdrs\n${JSON.stringify(cdrData, null, 2)}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = this.backend.createCdr(cdrData);
    this.logTraffic('in', `200 OK ${JSON.stringify(response)}`);
  }
}

