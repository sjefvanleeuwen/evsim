import type { IConnection } from '../interfaces/IConnection';
import { SimulatedConnection } from '../simulation/backend/SimulatedConnection';

export class OCPPClient {
  private connection: IConnection;
  private url: string;
  private chargePointId: string;
  
  // Callbacks for UI
  public onAuthStatus: ((status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx') => void) | null = null;
  public onTransactionStart: ((transactionId: number) => void) | null = null;
  public onTraffic: ((direction: 'in' | 'out', message: any) => void) | null = null;

  constructor(url: string, chargePointId: string, connection?: IConnection) {
    this.url = url;
    this.chargePointId = chargePointId;
    this.connection = connection || new SimulatedConnection();
  }

  connect() {
    const fullUrl = `${this.url}/${this.chargePointId}`;
    console.log(`Connecting to ${fullUrl}`);
    
    this.connection.onOpen = () => {
      console.log("Connected to OCPP Central System");
      this.sendBootNotification();
    };

    this.connection.onMessage = (event) => {
      console.log("Received message:", event.data);
      const data = JSON.parse(event.data);
      if (this.onTraffic) {
        this.onTraffic('in', data);
      }
      this.handleMessage(data);
    };

    this.connection.onClose = () => {
      console.log("Disconnected from OCPP Central System");
    };

    this.connection.onError = (error) => {
      console.error("Connection error:", error);
    };

    this.connection.connect(fullUrl, "ocpp1.6");
  }

  authorize(idTag: string) {
    const msg = [
      2,
      this.generateMessageId(),
      "Authorize",
      { idTag }
    ];
    this.send(msg);
  }

  startTransaction(idTag: string, connectorId: number, meterStart: number, timestamp: string) {
    const msg = [
      2,
      this.generateMessageId(),
      "StartTransaction",
      { 
        connectorId,
        idTag,
        meterStart,
        timestamp
      }
    ];
    this.send(msg);
  }

  stopTransaction(transactionId: number, idTag: string, meterStop: number, timestamp: string) {
    const msg = [
      2,
      this.generateMessageId(),
      "StopTransaction",
      { 
        transactionId,
        idTag,
        meterStop,
        timestamp,
        reason: "Local"
      }
    ];
    this.send(msg);
  }

  meterValues(connectorId: number, transactionId: number, meterValue: number) {
    const msg = [
      2,
      this.generateMessageId(),
      "MeterValues",
      {
        connectorId,
        transactionId,
        meterValue: [{
          timestamp: new Date().toISOString(),
          sampledValue: [{
            value: String(meterValue),
            context: "Sample.Periodic",
            format: "Raw",
            measurand: "Energy.Active.Import.Register",
            location: "Outlet",
            unit: "Wh"
          }]
        }]
      }
    ];
    this.send(msg);
  }

  sendBootNotification() {
    const msg = [
      2, // Call
      this.generateMessageId(),
      "BootNotification",
      {
        chargePointVendor: "ChargePoint Simulator",
        chargePointModel: "Virtual CP 1.0",
      },
    ];
    this.send(msg);
  }

  send(message: any) {
    if (this.onTraffic) {
      this.onTraffic('out', message);
    }
    this.connection.send(JSON.stringify(message));
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private handleMessage(data: any) {
    const [messageTypeId, _messageId, payload] = data;

    if (messageTypeId === 3) { // CALLRESULT
      // Simple handling for now - in a real app we'd match messageId to the request
      
      if (payload.transactionId) {
        // This is a StartTransaction response
        if (this.onTransactionStart) {
          this.onTransactionStart(payload.transactionId);
        }
      } else if (payload.idTagInfo) {
        // This is likely an Authorize response (since it has no transactionId)
        console.log("Auth Response:", payload.idTagInfo.status);
        if (this.onAuthStatus) {
          this.onAuthStatus(payload.idTagInfo.status);
        }
      }
    }
  }
}
