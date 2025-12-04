# Simulated Backend Architecture

This folder contains a fully client-side simulation of a Charging Station Management System (CSMS) and OCPI backend.

## Components

### 1. Simulated CSMS (`backend/SimulatedCSMS.ts`)
- Acts as the central system for OCPP communication.
- Implements OCPP 1.6J message handling (BootNotification, Authorize, StartTransaction, etc.).
- Maintains in-memory state for connected chargers and transactions.
- Singleton pattern ensures state persistence across component re-renders.

### 2. Simulated Connection (`backend/SimulatedConnection.ts`)
- Implements `IConnection` interface.
- Replaces `WebSocket` for client-side simulation.
- Introduces artificial network latency to mimic real-world conditions.

### 3. Simulated OCPI Backend (`backend/SimulatedOCPIBackend.ts`)
- Simulates an OCPI platform (eMSP/CPO).
- Provides mock data for Locations, Tariffs, and Tokens.
- Can be used to simulate roaming authorization.

### 4. Virtual API (`api/SimulatedApiClient.ts`)
- Implements `IApiClient`.
- Provides "REST-like" async methods to fetch data from the simulated backend.
- Interchangeable with a real HTTP client.

## Usage

The `OCPPClient` defaults to using `SimulatedConnection`. To switch to a real backend, inject `RealWebSocketConnection` into the `OCPPClient` constructor.

```typescript
// For Simulation (Default)
const client = new OCPPClient('ws://mock', 'CP001');

// For Real Backend
const connection = new RealWebSocketConnection();
const client = new OCPPClient('ws://real-csms.com', 'CP001', connection);
```
