import { SimulatedConnection } from './SimulatedConnection';
import { SimulatedApiClient } from '../../api/SimulatedApiClient';
import { SimulatedCDRStore } from './SimulatedCDRStore';

export class SimulatedCSMS {
  private static instance: SimulatedCSMS;
  private connections: Map<string, SimulatedConnection> = new Map();
  private ocpiClient: SimulatedApiClient;
  
  // Simulated Database
  private authorizedTags: Map<string, { status: string, parentId?: string }> = new Map([
    ['DEADBEEF', { status: 'Accepted', parentId: 'PARENT_1' }],
    ['12345678', { status: 'Accepted', parentId: 'PARENT_2' }],
    ['AABBCCDD', { status: 'Accepted', parentId: 'PARENT_3' }],
    ['BLOCKED', { status: 'Blocked' }],
    ['EXPIRED', { status: 'Expired' }],
    ['PLUG-N-CHARGE', { status: 'Accepted', parentId: 'OEM_PNC' }]
  ]);
  private activeTransactions: Map<string, number> = new Map(); // TransactionId -> ConnectorId
  private transactionToSession: Map<number, string> = new Map(); // TransactionId -> OCPI Session ID
  private transactionCounter = 1000;
  private logCallback: ((msg: string) => void) | null = null;

  private constructor() {
    this.ocpiClient = SimulatedApiClient.getInstance();
  }

  public static getInstance(): SimulatedCSMS {
    if (!SimulatedCSMS.instance) {
      SimulatedCSMS.instance = new SimulatedCSMS();
    }
    return SimulatedCSMS.instance;
  }

  public setLogger(callback: (msg: string) => void) {
    this.logCallback = callback;
  }

  private log(msg: string) {
    console.log(`[CSMS] ${msg}`);
    if (this.logCallback) {
      this.logCallback(msg);
    }
  }

  public registerConnection(cpId: string, connection: SimulatedConnection) {
    this.connections.set(cpId, connection);
    this.log(`CP ${cpId} connected.`);
  }

  public closeConnection(cpId: string) {
    this.connections.delete(cpId);
    this.log(`CP ${cpId} disconnected.`);
  }

  public handleMessage(cpId: string, data: string) {
    try {
      const [messageTypeId, messageId, action, payload] = JSON.parse(data);
      
      if (messageTypeId === 2) { // CALL
        this.log(`Received ${action} from ${cpId}`);
        this.processCall(cpId, messageId, action, payload);
      }
    } catch (e) {
      console.error(`[CSMS] Failed to parse message from ${cpId}`, e);
    }
  }

  private processCall(cpId: string, messageId: string, action: string, payload: any) {
    let responsePayload = {};

    switch (action) {
      case 'BootNotification':
        responsePayload = {
          status: 'Accepted',
          currentTime: new Date().toISOString(),
          interval: 300
        };
        break;

      case 'Heartbeat':
        responsePayload = {
          currentTime: new Date().toISOString()
        };
        break;

      case 'StatusNotification':
        responsePayload = {}; // Empty response for StatusNotification
        break;

      case 'Authorize':
        // Check OCPI Roaming first (Simulated)
        this.log(`Checking OCPI Roaming for ${payload.idTag}...`);
        this.ocpiClient.authorize(payload.idTag).then(allowed => {
            // In a real system, we'd wait for this. 
            // For this sim, we'll just log it and proceed with local check or override.
            this.log(`OCPI Auth Result for ${payload.idTag}: ${allowed}`);
        });

        const tagInfo = this.authorizedTags.get(payload.idTag);
        responsePayload = {
          idTagInfo: {
            status: tagInfo ? tagInfo.status : 'Invalid',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            parentIdTag: tagInfo?.parentId
          }
        };
        break;

      case 'StartTransaction':
        const transactionId = ++this.transactionCounter;
        const startTagInfo = this.authorizedTags.get(payload.idTag);
        const isStartAuthorized = startTagInfo && startTagInfo.status === 'Accepted';
        
        if (isStartAuthorized) {
            this.activeTransactions.set(String(transactionId), payload.connectorId);
            this.log(`Transaction ${transactionId} started on Connector ${payload.connectorId}`);
            
            // Create OCPI Session
            const sessionId = Math.random().toString(36).substring(7).toUpperCase();
            this.transactionToSession.set(transactionId, sessionId);
            this.log(`Mapped Transaction ${transactionId} to OCPI Session ${sessionId}`);
            
            this.ocpiClient.putSession(sessionId, {
                id: sessionId,
                start_datetime: new Date().toISOString(),
                kwh: 0,
                auth_id: payload.idTag,
                auth_method: "AUTH_REQUEST",
                location_id: "LOC001",
                evse_uid: `EVSE00${payload.connectorId}`,
                connector_id: String(payload.connectorId),
                currency: "USD",
                status: "ACTIVE",
                total_cost: { excl_vat: 0, incl_vat: 0 }
            });
        }

        responsePayload = {
          transactionId: transactionId,
          idTagInfo: {
            status: isStartAuthorized ? 'Accepted' : 'Invalid'
          }
        };
        break;

      case 'StopTransaction':
        this.activeTransactions.delete(String(payload.transactionId));
        this.log(`Transaction ${payload.transactionId} stopped`);
        
        // End OCPI Session & Create CDR
        const stopSessionId = this.transactionToSession.get(payload.transactionId);
        if (stopSessionId) {
            const kwh = payload.meterStop / 1000; // Assuming meter is Wh
            const cost = kwh * 0.35; // Simple cost calc

            this.log(`Closing OCPI Session ${stopSessionId} and creating CDR`);

            this.ocpiClient.putSession(stopSessionId, {
                id: stopSessionId,
                kwh: kwh,
                end_datetime: new Date().toISOString(),
                status: "COMPLETED",
                total_cost: { excl_vat: cost, incl_vat: cost }
            });

            const cdrId = Math.random().toString(36).substring(7).toUpperCase();
            const stopTime = new Date().toISOString();
            
            // Store CDR in our local backend (for Portal)
            SimulatedCDRStore.getInstance().addCDR({
              id: cdrId,
              sessionId: stopSessionId,
              locationId: "LOC001",
              evseId: `EVSE00${payload.connectorId || 1}`,
              authId: payload.idTag,
              startTime: new Date(Date.now() - 3600000).toISOString(), // Mock start time (1h ago)
              stopTime: stopTime,
              totalEnergy: kwh,
              totalCost: cost,
              currency: "USD",
              meterStart: 0, // Mock
              meterStop: payload.meterStop,
              status: 'COMPLETED'
            });

            this.ocpiClient.postCdr({
                id: cdrId,
                start_date_time: new Date().toISOString(), // Should be actual start time
                stop_date_time: stopTime,
                auth_id: payload.idTag,
                auth_method: "AUTH_REQUEST",
                location_id: "LOC001",
                evse_uid: "EVSE001",
                currency: "USD",
                tariffs: [{
                    id: "TAR001",
                    currency: "USD",
                    price_components: [{ type: "ENERGY", price: 0.35, step_size: 1 }]
                }],
                charging_periods: [{
                    start_date_time: new Date().toISOString(),
                    dimensions: [{ type: "ENERGY", volume: kwh }]
                }],
                total_cost: { excl_vat: cost, incl_vat: cost },
                total_energy: kwh,
                total_time: 0 // Should calculate duration
            });
            
            this.transactionToSession.delete(payload.transactionId);
        }

        responsePayload = {
          idTagInfo: {
            status: 'Accepted'
          }
        };
        break;
        
      case 'MeterValues':
        // Update OCPI Session
        const mvSessionId = this.transactionToSession.get(payload.transactionId);
        if (mvSessionId && payload.meterValue && payload.meterValue.length > 0) {
            // Try to find energy import register
            const energySample = payload.meterValue[0].sampledValue.find((s: any) => s.measurand === 'Energy.Active.Import.Register');
            if (energySample) {
                const kwh = parseFloat(energySample.value) / 1000;
                const cost = kwh * 0.35;
                
                // this.log(`Updating OCPI Session ${mvSessionId} with ${kwh.toFixed(3)} kWh`); // Optional: too verbose?
                
                this.ocpiClient.putSession(mvSessionId, {
                    id: mvSessionId,
                    kwh: kwh,
                    last_updated: new Date().toISOString(),
                    status: "ACTIVE",
                    total_cost: { excl_vat: cost, incl_vat: cost }
                });
            }
        }
        responsePayload = {};
        break;

      default:
        console.warn(`[CSMS] Unknown action: ${action}`);
        // Send CallError? For now just empty object or ignore
        return; 
    }

    this.sendCallResult(cpId, messageId, responsePayload);
  }

  private sendCallResult(cpId: string, messageId: string, payload: any) {
    const response = [
      3, // CALLRESULT
      messageId,
      payload
    ];
    
    const connection = this.connections.get(cpId);
    if (connection) {
      connection.receive(JSON.stringify(response));
    }
  }
}
