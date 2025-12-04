export class SimulatedOCPIBackend {
  private static instance: SimulatedOCPIBackend;

  // Mock Data
  private locations = [
    {
      id: "LOC001",
      type: "ON_STREET",
      name: "ChargePoint HQ",
      address: "254 E Hacienda Ave, Campbell, CA 95008",
      city: "Campbell",
      postal_code: "95008",
      country: "USA",
      coordinates: {
        latitude: "37.2872",
        longitude: "-121.9400"
      },
      evses: [
        {
          uid: "US*CPI*E12345",
          evse_id: "US*CPI*E12345",
          status: "AVAILABLE",
          connectors: [
            {
              id: "1",
              standard: "IEC_62196_T2",
              format: "SOCKET",
              power_type: "AC_3_PHASE",
              max_voltage: 400,
              max_amperage: 32,
              tariff_id: "TAR001"
            }
          ]
        }
      ]
    }
  ];

  private tariffs = [
    {
      id: "TAR001",
      currency: "USD",
      elements: [
        {
          price_components: [
            {
              type: "ENERGY",
              price: 0.35,
              step_size: 1
            }
          ]
        }
      ]
    }
  ];

  private sessions: Map<string, any> = new Map();
  private cdrs: any[] = [];

  private constructor() {}

  public static getInstance(): SimulatedOCPIBackend {
    if (!SimulatedOCPIBackend.instance) {
      SimulatedOCPIBackend.instance = new SimulatedOCPIBackend();
    }
    return SimulatedOCPIBackend.instance;
  }

  // Public "API" methods
  public getLocations() {
    return this.locations;
  }

  public getTariffs() {
    return this.tariffs;
  }

  public authorizeToken(tokenUid: string): boolean {
    // Simulate checking against a roaming database
    const validTokens = ['DEADBEEF', '12345678', 'AABBCCDD'];
    return validTokens.includes(tokenUid);
  }

  public updateSession(sessionId: string, sessionData: any) {
    this.sessions.set(sessionId, {
      ...sessionData,
      last_updated: new Date().toISOString()
    });
    console.log(`[OCPI Backend] Session ${sessionId} updated`, sessionData);
    return {
      status_code: 1000,
      status_message: "Success",
      timestamp: new Date().toISOString()
    };
  }

  public createCdr(cdrData: any) {
    this.cdrs.push(cdrData);
    console.log(`[OCPI Backend] CDR created`, cdrData);
    return {
      status_code: 1000,
      status_message: "Success",
      timestamp: new Date().toISOString(),
      data: {
        id: cdrData.id,
        url: `https://example.com/ocpi/cpo/2.2/cdrs/${cdrData.id}`
      }
    };
  }
}
