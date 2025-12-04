# ChargePoint EV Simulation & Partner Portal

A comprehensive Electric Vehicle (EV) charging network simulation and management platform. This project demonstrates a high-scale simulation of 15,000+ EV charging assets across the Netherlands, integrated with a Partner Portal for fleet management, quoting, and real-time monitoring.

## 🚀 Key Features

### 🌍 Large-Scale Simulation
- **15,000+ Simulated Assets**: Real-time simulation of EV chargers distributed across major Dutch cities.
- **Web Worker Architecture**: Simulation logic runs in a background thread to ensure UI responsiveness while processing thousands of state changes per second.
- **Realistic Traffic Patterns**:
  - **Home Charging**: Evening peaks, long duration.
  - **Public/Fast Charging**: Daytime peaks, short duration.
  - **Retail (Albert Heijn)**: Store hour peaks, high turnover.

### 🏢 Partner Portal
- **Network Map**: Interactive visualization of all charging assets using Leaflet.
- **Occupancy View**: Real-time dashboard showing utilization rates for retail locations (e.g., Albert Heijn parking lots).
- **Session Management**: Live feed of Charge Detail Records (CDRs) with energy and cost calculations.
- **Order Management**: Workflow for approving quotes and tracking installation orders.

### 🛠️ Tools & Workflows
- **CPQ Wizard**: Configure, Price, Quote tool for generating new charging infrastructure proposals.
- **Installer App**: Mobile-friendly view for field technicians.
- **Vehicle Simulator**: Dashboard to simulate connection events from a vehicle's perspective.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Custom Singleton Stores with Event Emitters
- **Maps**: Leaflet / React-Leaflet
- **Build System**: Turborepo
- **Performance**: Web Workers for off-main-thread simulation

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chargepoint
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

## 📂 Project Structure

```
├── apps/
│   └── web/                 # Main React Application
│       ├── src/
│       │   ├── components/  # UI Components (Portal, CPQ, Map)
│       │   ├── lib/
│       │   │   └── simulation/ # Core Simulation Logic
│       │   │       ├── worker/ # Web Worker implementation
│       │   │       ├── data/   # Asset generation & City data
│       │   │       └── backend/# Simulated Backend Stores
│       │   └── ...
├── packages/                # Shared packages (if any)
├── turbo.json              # Turborepo configuration
└── package.json
```

## 🎮 Simulation Details

The simulation generates a realistic fleet of chargers upon startup.
- **Time Scaling**: The simulation runs at **100x real-time speed** (1 real second = 100 virtual seconds).
- **Persistence**: Completed sessions (CDRs) are saved to browser `localStorage` to persist across reloads.
- **Logic**: Probabilistic models determine when cars arrive and leave based on location type (Home vs. Retail vs. Public) and time of day.

## 🔌 Industry Standards & Terminology

This project simulates core components of the EV charging ecosystem:

- **CSMS (Charging Station Management System)**:
  - *What it is*: The central backend software used by Charge Point Operators (CPOs) to manage chargers, monitor status, and handle billing.
  - *In this project*: The `SimulatedAssetStore` acts as the CSMS, maintaining the state of all 15,000 assets and processing incoming messages from the field.

- **OCPP (Open Charge Point Protocol)**:
  - *What it is*: The global standard protocol that charging stations use to communicate with the CSMS. It handles things like authorization, starting/stopping charging, and sending meter values.
  - *In this project*: The communication between the Web Worker (simulating the hardware) and the Main Thread (CSMS) mimics OCPP messages like `StatusNotification` (Available/Charging), `StartTransaction`, and `StopTransaction`.

- **OCPI (Open Charge Point Interface)**:
  - *What it is*: The protocol used for "roaming" — allowing drivers to use chargers owned by different operators. It facilitates the exchange of location data, tariffs, and sessions.
  - *In this project*: The **Partner Portal** demonstrates the kind of data shared via OCPI, specifically the **CDRs (Charge Detail Records)** which are generated after every session for billing purposes.

---

*Note: This is a simulation project for demonstration purposes. No real hardware is connected.*
