import { BrowserStorage } from '../../storage/BrowserStorage';
import type { IStorage } from '../../interfaces/IStorage';

export type CustomerType = 'B2B2C_LEASE' | 'B2B_RETAIL';

export interface Quote {
  id: string;
  customerType: CustomerType;
  customerName: string;
  email: string;
  hardware: {
    model: string;
    price: number;
  };
  installation: {
    cableLength: number;
    excavation: boolean;
    panelUpgrade: boolean;
    price: number;
  };
  totalPrice: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Order {
  id: string;
  quoteId: string;
  status: 'ORDERED' | 'SHIPPED' | 'SCHEDULED' | 'INSTALLED' | 'COMMISSIONED';
  installationDate?: string;
  serialNumber?: string;
  cpId?: string;
}

export class SimulatedERP {
  private static instance: SimulatedERP;
  private quotes: Map<string, Quote> = new Map();
  private orders: Map<string, Order> = new Map();
  private listeners: ((quotes: Quote[], orders: Order[]) => void)[] = [];
  private storage: IStorage;

  private constructor() {
    this.storage = BrowserStorage.getInstance();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedQuotes = this.storage.getItem<Quote[]>('erp_quotes');
    if (storedQuotes) {
      storedQuotes.forEach(q => this.quotes.set(q.id, q));
    }

    const storedOrders = this.storage.getItem<Order[]>('erp_orders');
    if (storedOrders) {
      storedOrders.forEach(o => this.orders.set(o.id, o));
    }
  }

  private saveToStorage() {
    this.storage.setItem('erp_quotes', Array.from(this.quotes.values()));
    this.storage.setItem('erp_orders', Array.from(this.orders.values()));
  }

  public static getInstance(): SimulatedERP {
    if (!SimulatedERP.instance) {
      SimulatedERP.instance = new SimulatedERP();
    }
    return SimulatedERP.instance;
  }

  public createQuote(data: Omit<Quote, 'id' | 'status' | 'createdAt'>): Quote {
    const id = `Q-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const quote: Quote = {
      ...data,
      id,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    };
    this.quotes.set(id, quote);
    this.notifyListeners();
    return quote;
  }

  public getQuotes(): Quote[] {
    return Array.from(this.quotes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  public updateOrder(orderId: string, updates: Partial<Order>): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const updatedOrder = { ...order, ...updates };
    this.orders.set(orderId, updatedOrder);
    this.notifyListeners();
    return updatedOrder;
  }

  public approveQuote(quoteId: string): Order | null {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;

    quote.status = 'APPROVED';
    
    const orderId = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const order: Order = {
      id: orderId,
      quoteId: quote.id,
      status: 'ORDERED'
    };
    
    this.orders.set(orderId, order);
    this.notifyListeners();
    return order;
  }

  public subscribe(listener: (quotes: Quote[], orders: Order[]) => void) {
    this.listeners.push(listener);
    listener(this.getQuotes(), this.getOrders());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.saveToStorage();
    const quotes = this.getQuotes();
    const orders = this.getOrders();
    this.listeners.forEach(l => l(quotes, orders));
  }
}
