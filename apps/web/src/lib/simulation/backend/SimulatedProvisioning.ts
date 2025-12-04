import { SimulatedERP } from './SimulatedERP';

export class SimulatedProvisioning {
  private static instance: SimulatedProvisioning;

  private constructor() {}

  public static getInstance(): SimulatedProvisioning {
    if (!SimulatedProvisioning.instance) {
      SimulatedProvisioning.instance = new SimulatedProvisioning();
    }
    return SimulatedProvisioning.instance;
  }

  public commissionCharger(orderId: string, serialNumber: string, cpId: string): boolean {
    const erp = SimulatedERP.getInstance();
    const order = erp.getOrders().find(o => o.id === orderId);

    if (!order) {
      console.error(`[Provisioning] Order ${orderId} not found.`);
      return false;
    }

    if (order.status === 'COMMISSIONED') {
      console.warn(`[Provisioning] Order ${orderId} is already commissioned.`);
      return true;
    }

    // Update ERP
    erp.updateOrder(orderId, {
      status: 'COMMISSIONED',
      serialNumber,
      cpId,
      installationDate: new Date().toISOString()
    });

    console.log(`[Provisioning] Commissioned ${cpId} (SN: ${serialNumber}) for Order ${orderId}`);
    
    return true;
  }
}
